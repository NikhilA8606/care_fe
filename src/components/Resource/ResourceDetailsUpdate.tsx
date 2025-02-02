import { useQuery } from "@tanstack/react-query";
import { t } from "i18next";
import { navigate, useQueryParams } from "raviger";
import { useReducer, useState } from "react";
import { toast } from "sonner";

import Card from "@/CAREUI/display/Card";

import Autocomplete from "@/components/ui/autocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import CircularProgress from "@/components/Common/CircularProgress";
import Loading from "@/components/Common/Loading";
import Page from "@/components/Common/Page";
import UserAutocomplete from "@/components/Common/UserAutocompleteFormField";
import { FieldChangeEvent } from "@/components/Form/FormFields/Utils";
import { UserModel } from "@/components/Users/models";

import useAppHistory from "@/hooks/useAppHistory";

import { RESOURCE_STATUS_CHOICES } from "@/common/constants";

import routes from "@/Utils/request/api";
import query from "@/Utils/request/query";
import request from "@/Utils/request/request";
import { PaginatedResponse } from "@/Utils/request/types";
import useTanStackQueryInstead from "@/Utils/request/useQuery";
import { FacilityData } from "@/types/facility/facility";
import facilityApi from "@/types/facility/facilityApi";
import { UpdateResourceRequest } from "@/types/resourceRequest/resourceRequest";

interface resourceProps {
  id: string;
  facilityId: string;
}

const initForm: Partial<UpdateResourceRequest> = {
  assigned_facility: null,
  emergency: false,
  title: "",
  reason: "",
  assigned_to: null,
};

const requiredFields: any = {
  assigned_facility_type: {
    errorText: "Please Select Facility Type",
  },
};

const initError = Object.assign(
  {},
  ...Object.keys(initForm).map((k) => ({ [k]: "" })),
);

const initialState = {
  form: { ...initForm },
  errors: { ...initError },
};

export const ResourceDetailsUpdate = (props: resourceProps) => {
  const { goBack } = useAppHistory();
  const [qParams, _] = useQueryParams();
  const [isLoading, setIsLoading] = useState(true);
  const [assignedUser, SetAssignedUser] = useState<UserModel>();
  const resourceFormReducer = (state = initialState, action: any) => {
    switch (action.type) {
      case "set_form": {
        return {
          ...state,
          form: action.form,
        };
      }
      case "set_error": {
        return {
          ...state,
          errors: action.errors,
        };
      }
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(resourceFormReducer, initialState);

  const { data: facilitiesResponse } = useQuery<
    PaginatedResponse<FacilityData>
  >({
    queryKey: ["facilities", qParams],
    queryFn: query.debounced(facilityApi.getAllFacilities, {
      queryParams: {
        name: qParams.name,
        ...(qParams.facility_type && { facility_type: qParams.facility_type }),
        ...(qParams.organization && {
          organization: qParams.organization,
        }),
      },
    }),
  });

  const facilityOptions = facilitiesResponse?.results.map((facility) => ({
    label: facility.name,
    value: facility.id,
  }));

  const { loading: assignedUserLoading } = useTanStackQueryInstead(
    routes.userList,
    {
      onResponse: ({ res, data }) => {
        if (res?.ok && data && data.count) {
          SetAssignedUser(data.results[0]);
        }
      },
    },
  );

  const validateForm = () => {
    const errors = { ...initError };
    let isInvalidForm = false;
    Object.keys(requiredFields).forEach((field) => {
      if (!state.form[field] || !state.form[field].length) {
        errors[field] = requiredFields[field].errorText;
        isInvalidForm = true;
      }
    });

    dispatch({ type: "set_error", errors });
    return isInvalidForm;
  };

  const handleChange = (e: FieldChangeEvent<unknown>) => {
    dispatch({
      type: "set_form",
      form: { ...state.form, [e.name]: e.value },
    });
  };

  const handleOnSelect = (user: any) => {
    const form = { ...state.form };
    form["assigned_to"] = user?.value?.id;
    SetAssignedUser(user.value);
    dispatch({ type: "set_form", form });
  };

  const setFacility = (selected: any, name: string) => {
    const form = { ...state.form };
    form[name] = selected;
    dispatch({ type: "set_form", form });
  };

  const { data: resourceDetails } = useTanStackQueryInstead(
    routes.getResourceDetails,
    {
      pathParams: { id: props.id },
      onResponse: ({ res, data }) => {
        if (res && data) {
          const d = data;
          d["status"] = qParams.status || data.status.toLowerCase();
          dispatch({ type: "set_form", form: d });
        }
        setIsLoading(false);
      },
    },
  );

  const handleSubmit = async () => {
    const validForm = validateForm();

    if (validForm) {
      setIsLoading(true);

      const resourceData: UpdateResourceRequest = {
        id: props.id,
        status: state.form.status,
        origin_facility: state.form.origin_facility?.id,
        assigned_facility: state.form?.assigned_facility?.id,
        emergency: [true, "true"].includes(state.form.emergency),
        title: state.form.title,
        reason: state.form.reason,
        assigned_to: state.form.assigned_to,
        category: state.form.category,
        priority: state.form.priority,
        referring_facility_contact_number:
          state.form.referring_facility_contact_number,
        referring_facility_contact_name:
          state.form.referring_facility_contact_name,
        approving_facility: state.form.approving_facility?.id,
        related_patient: state.form.related_patient?.id,
      };

      const { res, data } = await request(routes.updateResource, {
        pathParams: { id: props.id },
        body: resourceData,
      });
      setIsLoading(false);

      if (res && res.status == 200 && data) {
        dispatch({ type: "set_form", form: data });
        toast.success(t("request_updated_successfully"));
        navigate(`/facility/${props.facilityId}/resource/${props.id}`);
      } else {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Page
      title="Update Request"
      backUrl={`/facility/${props.facilityId}/resource/${props.id}`}
      crumbsReplacements={{ [props.id]: { name: resourceDetails?.title } }}
    >
      <div className="mt-4">
        <Card className="flex w-full flex-col">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-1">
              <Label className="text-gray-700 mt-2 mb-3">{t("status")}</Label>
              <Select
                value={state.form.status}
                onValueChange={(value) =>
                  handleChange({ name: "status", value })
                }
              >
                <SelectTrigger className="mt-2">
                  <span>{state.form.status || "Select an option"}</span>
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_STATUS_CHOICES.map((option) => (
                    <SelectItem
                      key={option.text}
                      value={option.text}
                      onSelect={() =>
                        handleChange({ name: "status", value: option.text })
                      }
                    >
                      {t(`resource_status__${option.text}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-1">
              <Label className="text-gray-700 mt-2 mb-3">
                {t("assigned_to")}
              </Label>
              {assignedUserLoading ? (
                <CircularProgress />
              ) : (
                <UserAutocomplete
                  value={assignedUser === null ? undefined : assignedUser}
                  onChange={handleOnSelect}
                  error=""
                  name="assigned_to"
                />
              )}
            </div>

            <div>
              <Label className="text-gray-700 -mt-3 mb-3">
                {t("facility_assign_request")}
              </Label>
              <Autocomplete
                options={facilityOptions ?? []}
                placeholder={t("facility_assign_request_placeholder")}
                className="w-[calc(100vw-2rem)] sm:max-w-min sm:min-w-64"
                value={state.form.assigned_facility}
                onChange={(selected) =>
                  setFacility(selected, "assigned_facility")
                }
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-gray-700 mb-3 mt-1">
                {t("request_title")}
              </Label>
              <Input
                name="title"
                type="text"
                placeholder="Type your title here"
                value={state.form.title}
                onChange={(e) =>
                  handleChange({ name: e.target.name, value: e.target.value })
                }
              />
              {state.errors.title && (
                <p className="text-red-500 text-sm mt-2">
                  {state.errors.emergency}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label className="text-gray-700 mb-3 mt-1">
                {t("request_reason")}
              </Label>
              <Textarea
                rows={5}
                name="reason"
                placeholder={t("request_reason_placeholder")}
                value={state.form.reason}
                onChange={(e) =>
                  handleChange({ name: e.target.name, value: e.target.value })
                }
              />
              {state.errors.reason && (
                <p className="text-red-500 text-sm mt-2">
                  {state.errors.emergency}
                </p>
              )}
            </div>

            <div>
              <Label className="text-gray-700 mb-3 mt-1">
                {t("is_this_an_emergency")}
              </Label>
              <RadioGroup
                name="emergency"
                value={String(state.form.emergency)}
                onValueChange={(value) =>
                  handleChange({ name: "emergency", value: value === "true" })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" />
                  <Label>{t("yes")}</Label>
                  <RadioGroupItem value="false" />
                  <Label>{t("no")}</Label>
                </div>
              </RadioGroup>
              {state.errors.emergency && (
                <p className="text-red-500 text-sm mt-2">
                  {state.errors.emergency}
                </p>
              )}
            </div>

            <div className="mt-4 flex flex-col justify-between gap-2 md:col-span-2 md:flex-row">
              <Button type="button" variant="outline" onClick={() => goBack()}>
                {t("cancel")}
              </Button>
              <Button type="submit" variant="primary" onClick={handleSubmit}>
                {t("submit")}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Page>
  );
};
