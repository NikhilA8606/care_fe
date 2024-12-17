import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from "@hello-pangea/dnd";
import { ReactNode, RefObject, useEffect, useRef, useState } from "react";

import CareIcon from "@/CAREUI/icons/CareIcon";

import {
  PaginatedResponse,
  QueryParams,
  QueryRoute,
} from "@/Utils/request/types";
import useTanStackQueryInstead from "@/Utils/request/useQuery";

export interface KanbanBoardProps<T extends { id: string }> {
  title?: ReactNode;
  onDragEnd: OnDragEndResponder<string>;
  sections: {
    id: string;
    title: ReactNode;
    fetchOptions: (
      id: string,
      ...args: unknown[]
    ) => {
      route: QueryRoute<PaginatedResponse<T>>;
      options?: { query?: QueryParams };
    };
  }[];
  itemRender: (item: T) => ReactNode;
}

export default function KanbanBoard<T extends { id: string }>(
  props: KanbanBoardProps<T>,
) {
  const board = useRef<HTMLDivElement>(null);

  return (
    <div className="h-[calc(100vh-114px)] md:h-[calc(100vh-50px)]">
      <div className="flex flex-col items-end justify-between md:flex-row">
        <div>{props.title}</div>
        <div className="flex items-center gap-2 py-2">
          {[0, 1].map((button, i) => (
            <button
              key={i}
              onClick={() => {
                board.current?.scrollBy({
                  left: button ? 250 : -250,
                  behavior: "smooth",
                });
              }}
              className="inline-flex aspect-square h-8 items-center justify-center rounded-full border border-secondary-400 bg-secondary-200 text-2xl hover:bg-secondary-300"
            >
              <CareIcon icon={`l-${button ? "arrow-right" : "arrow-left"}`} />
            </button>
          ))}
        </div>
      </div>
      <DragDropContext onDragEnd={props.onDragEnd}>
        <div className="h-full overflow-auto" ref={board}>
          <div className="flex items-stretch px-0 pb-2">
            {props.sections.map((section, i) => (
              <KanbanSection<T>
                key={i}
                section={section}
                itemRender={props.itemRender}
                boardRef={board}
              />
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}

function KanbanSection<T extends { id: string }>(
  props: Omit<KanbanBoardProps<T>, "sections" | "onDragEnd"> & {
    section: KanbanBoardProps<T>["sections"][number];
    boardRef: RefObject<HTMLDivElement>;
  },
) {
  const { section } = props;

  const [items, setItems] = useState<T[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  const { data, loading, refetch } = useTanStackQueryInstead<
    PaginatedResponse<T>
  >(section.fetchOptions(section.id).route, {
    ...section.fetchOptions(section.id).options,
    query: section.fetchOptions(section.id).options?.query as QueryParams,
  });

  useEffect(() => {
    if (data?.results) {
      setItems((prevItems) => {
        const newItems = data.results.filter(
          (newItem) => !prevItems.some((item) => item.id === newItem.id),
        );
        return [...prevItems, ...newItems];
      });
      setNextPage(data.next || null);
      setTotalCount(data.count || 0);
    }
  }, [data]);

  const fetchNextPage = () => {
    if (loading || isFetching || !nextPage) return;
    setIsFetching(true);
    refetch().finally(() => setIsFetching(false));
  };

  useEffect(() => {
    const currentRef = props.boardRef.current;

    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const lastEntry = entries[0];
        if (lastEntry.isIntersecting) {
          fetchNextPage();
        }
      },
      { root: currentRef, threshold: 0.5 },
    );

    const lastItem = currentRef?.lastElementChild;
    if (lastItem) observer.observe(lastItem);

    return () => {
      if (lastItem) observer.unobserve(lastItem);
    };
  }, [nextPage, loading, isFetching]);

  // console.log("Items:", items);

  return (
    <Droppable droppableId={section.id}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          className="relative mr-2 w-[300px] shrink-0 rounded-xl bg-secondary-200"
        >
          <div className="sticky top-0 rounded-xl bg-secondary-200 pt-2">
            <div className="mx-2 flex items-center justify-between rounded-lg border border-secondary-300 bg-white p-4">
              <div>{section.title}</div>
              <div>
                <span className="ml-2 rounded-lg bg-secondary-300 px-2">
                  {totalCount}
                </span>
              </div>
            </div>
          </div>

          <div>
            {items.map((item, i) => (
              <Draggable draggableId={item.id} key={item.id} index={i}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="mx-2 mt-2 w-[284px] rounded-lg border border-secondary-300 bg-white"
                  >
                    {props.itemRender(item)}
                  </div>
                )}
              </Draggable>
            ))}

            {loading || isFetching ? (
              <div className="mt-2 h-[50px] w-[284px] animate-pulse rounded-lg bg-secondary-300">
                Loading...
              </div>
            ) : null}
          </div>
        </div>
      )}
    </Droppable>
  );
}
