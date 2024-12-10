import {
  DataTypeFor,
  RequestTypeFor,
} from "@/components/Questionnaire/structured/types";

import { StructuredQuestionType } from "@/types/questionnaire/question";

interface StructuredHandlerContext {
  resourceId: string;
  encounterId: string;
}

type StructuredHandler<T extends StructuredQuestionType> = {
  getRequests: (
    data: DataTypeFor<T>[],
    context: StructuredHandlerContext,
  ) => Array<{
    url: string;
    method: string;
    body: RequestTypeFor<T>;
  }>;
};

const handlers: {
  [K in StructuredQuestionType]: StructuredHandler<K>;
} = {
  allergy_intolerance: {
    getRequests: (allergies, { resourceId, encounterId }) =>
      allergies.map((allergy) => {
        // Ensure all required fields have default values
        const body: RequestTypeFor<"allergy_intolerance"> = {
          clinical_status: allergy.clinicalStatus ?? "active",
          verification_status: allergy.verificationStatus ?? "unconfirmed",
          category: allergy.category ?? "medication",
          criticality: allergy.criticality ?? "low",
          code: allergy.code,
          last_occurrence: allergy.lastOccurrence,
          note: allergy.note,
          encounter: encounterId,
        };

        return {
          url: `/api/v1/patient/${resourceId}/allergy_intolerance/`,
          method: "POST",
          body,
        };
      }),
  },
  medication_request: {
    getRequests: (_medications, _context) => {
      // Implement medication request handling
      return [];
    },
  },
};

export function getStructuredRequests<T extends StructuredQuestionType>(
  type: T,
  data: DataTypeFor<T>[],
  context: StructuredHandlerContext,
) {
  return handlers[type].getRequests(data, context);
}
