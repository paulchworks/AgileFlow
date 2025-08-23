import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import StoryCard from "./StoryCard";

export default function KanbanColumn({ status, stories, tasks, onEditStory }) {
  return (
    <div className={`p-4 rounded-lg transition-colors duration-200 ${status.color}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">{status.title}</h3>
        <span className="text-sm font-medium bg-white/60 text-slate-700 px-2 py-1 rounded-full">
          {stories.length}
        </span>
      </div>
      <Droppable droppableId={status.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-3 min-h-[400px] transition-colors duration-200 rounded-md ${
              snapshot.isDraggingOver ? 'bg-black/10' : ''
            }`}
          >
            {stories.map((story, index) => (
              <Draggable key={story.id} draggableId={story.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{ ...provided.draggableProps.style }}
                    className={snapshot.isDragging ? 'opacity-80' : ''}
                  >
                    <StoryCard
                      story={story}
                      tasks={tasks.filter(t => t.story_id === story.id)}
                      onEdit={() => onEditStory(story)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}