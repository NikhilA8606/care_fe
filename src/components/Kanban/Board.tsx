import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from "@hello-pangea/dnd";
import { ReactNode, RefObject, useEffect, useRef } from "react";

import CareIcon from "@/CAREUI/icons/CareIcon";

import useDebounce from "@/hooks/useDebounce";

import { PaginatedResponse, QueryRoute } from "@/Utils/request/types";
import { useInfiniteQuery } from "@/Utils/request/useInfiniteQuery";
import { QueryOptions } from "@/Utils/request/useQuery";

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
      options?: QueryOptions<unknown>;
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

  const { items, loading, fetchNextPage, hasMore } = useInfiniteQuery<T>(
    section.fetchOptions(section.id).route,
    {
      ...section.fetchOptions(section.id).options,
      deduplicateBy: (item) => item.id,
    },
  );

  const debouncedScroll = useDebounce(() => {
    if (!props.boardRef.current || loading || !hasMore) return;

    const scrollTop = props.boardRef.current.scrollTop;
    const visibleHeight = props.boardRef.current.offsetHeight;
    const sectionHeight = props.boardRef.current.scrollHeight;

    if (scrollTop + visibleHeight >= sectionHeight - 100) {
      fetchNextPage();
    }
  }, 200);

  useEffect(() => {
    props.boardRef.current?.addEventListener("scroll", debouncedScroll);
    return () =>
      props.boardRef.current?.removeEventListener("scroll", debouncedScroll);
  }, [loading, hasMore, debouncedScroll, props.boardRef]); // Add props.boardRef here

  return (
    <Droppable droppableId={section.id}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          className="relative mr-2 w-[300px] shrink-0 rounded-xl bg-secondary-200"
        >
          <div ref={props.boardRef}>
            {items.map((item, i) => (
              <Draggable draggableId={item.id} key={i} index={i}>
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
            {loading && (
              <div className="mt-2 h-[300px] w-[284px] animate-pulse rounded-lg bg-secondary-300" />
            )}
          </div>
        </div>
      )}
    </Droppable>
  );
}
