import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, GripVertical, ChevronLeft, ChevronRight, ExternalLink, Clock, Tag, Edit2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import type { KanbanTask } from "@shared/schema";

interface KanbanBoard {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  roadmapId?: number | null;
  roadmapType?: string | null;
  createdAt: Date;
  updatedAt: Date;
  tasks?: KanbanTask[];
}

const KANBAN_COLUMNS = [
  { id: "todo", title: "To Do", color: "bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-900/30 border border-blue-700/50 backdrop-blur-sm" },
  { id: "done", title: "Done", color: "bg-green-900/30 border border-green-700/50 backdrop-blur-sm" }
];

export default function KanbanBoardPage() {
  const { toast } = useToast();
  const [match, params] = useRoute("/kanban/:id?");
  const [selectedBoard, setSelectedBoard] = useState<number | null>(null);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState("todo");
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  
  // Task details modal state
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDescription, setEditTaskDescription] = useState("");
  const [editTaskCategory, setEditTaskCategory] = useState("");
  const [editTaskEstimatedTime, setEditTaskEstimatedTime] = useState("");
  const [editTaskResources, setEditTaskResources] = useState<string[]>([]);
  const [newResource, setNewResource] = useState("");

  // Auto-select board from URL parameter
  useEffect(() => {
    if (params?.id) {
      const boardId = parseInt(params.id);
      if (!isNaN(boardId)) {
        setSelectedBoard(boardId);
      }
    }
  }, [params?.id]);

  const { data: boards, isLoading: boardsLoading } = useQuery<KanbanBoard[]>({
    queryKey: ["/api/kanban/boards"],
  });

  const { data: currentBoard, isLoading: boardLoading } = useQuery<KanbanBoard>({
    queryKey: ["/api/kanban/boards", selectedBoard],
    enabled: !!selectedBoard,
  });

  const createBoardMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const res = await apiRequest("POST", "/api/kanban/boards", data);
      return await res.json();
    },
    onSuccess: (newBoard: KanbanBoard) => {
      queryClient.invalidateQueries({ queryKey: ["/api/kanban/boards"] });
      setIsCreateBoardOpen(false);
      setNewBoardName("");
      setNewBoardDescription("");
      setSelectedBoard(newBoard.id);
      toast({
        title: "Board created",
        description: "Your Kanban board has been created successfully.",
      });
    },
  });

  const deleteBoardMutation = useMutation({
    mutationFn: async (boardId: number) => {
      const res = await apiRequest("DELETE", `/api/kanban/boards/${boardId}`);
      return await res.json();
    },
    onSuccess: (_data, deletedBoardId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/kanban/boards"] });
      if (selectedBoard === deletedBoardId) {
        setSelectedBoard(null);
      }
      toast({
        title: "Board deleted",
        description: "The board has been deleted successfully.",
      });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string; status: string }) => {
      if (!selectedBoard) throw new Error("No board selected");
      
      const tasks = currentBoard?.tasks || [];
      const position = tasks.filter(t => t.status === data.status).length;
      
      const res = await apiRequest("POST", `/api/kanban/boards/${selectedBoard}/tasks`, {
        ...data,
        position,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kanban/boards", selectedBoard] });
      setIsCreateTaskOpen(false);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskStatus("todo");
      toast({
        title: "Task created",
        description: "Your task has been created successfully.",
      });
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, status, position }: { taskId: number; status: string; position: number }) => {
      const res = await apiRequest("PATCH", `/api/kanban/tasks/${taskId}/status`, { status, position });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kanban/boards", selectedBoard] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const res = await apiRequest("DELETE", `/api/kanban/tasks/${taskId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kanban/boards", selectedBoard] });
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, title, description, category, estimatedTime, resources }: { 
      taskId: number; 
      title: string; 
      description: string;
      category?: string;
      estimatedTime?: string;
      resources?: string[];
    }) => {
      const res = await apiRequest("PATCH", `/api/kanban/tasks/${taskId}`, { 
        title, 
        description,
        category,
        estimatedTime,
        resources
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kanban/boards", selectedBoard] });
      setIsEditingTask(false);
      toast({
        title: "Task updated",
        description: "Task details have been saved successfully.",
      });
    },
  });

  const getTasksByStatus = (status: string): KanbanTask[] => {
    if (!currentBoard?.tasks) return [];
    return currentBoard.tasks
      .filter(task => task.status === status)
      .sort((a, b) => a.position - b.position);
  };

  const moveTask = (task: KanbanTask, direction: 'left' | 'right') => {
    const currentColumnIndex = KANBAN_COLUMNS.findIndex(col => col.id === task.status);
    const newColumnIndex = direction === 'left' ? currentColumnIndex - 1 : currentColumnIndex + 1;
    
    if (newColumnIndex < 0 || newColumnIndex >= KANBAN_COLUMNS.length) return;
    
    const newStatus = KANBAN_COLUMNS[newColumnIndex].id;
    const tasksInNewColumn = getTasksByStatus(newStatus);
    const newPosition = tasksInNewColumn.length;
    
    updateTaskStatusMutation.mutate({
      taskId: task.id,
      status: newStatus,
      position: newPosition
    });
  };

  const openTaskDetails = (task: KanbanTask) => {
    setSelectedTask(task);
    setEditTaskTitle(task.title);
    setEditTaskDescription(task.description || "");
    setEditTaskCategory(task.category || "");
    setEditTaskEstimatedTime(task.estimatedTime || "");
    setEditTaskResources(task.resources || []);
    setNewResource("");
    setIsEditingTask(false);
    setIsTaskDetailsOpen(true);
  };

  const handleSaveTask = () => {
    if (!selectedTask) return;
    updateTaskMutation.mutate({
      taskId: selectedTask.id,
      title: editTaskTitle,
      description: editTaskDescription,
      category: editTaskCategory,
      estimatedTime: editTaskEstimatedTime,
      resources: editTaskResources
    });
  };

  const handleAddResource = () => {
    if (newResource.trim()) {
      setEditTaskResources([...editTaskResources, newResource.trim()]);
      setNewResource("");
    }
  };

  const handleRemoveResource = (index: number) => {
    setEditTaskResources(editTaskResources.filter((_, i) => i !== index));
  };

  const handleStatusChange = (newStatus: string) => {
    if (!selectedTask) return;
    const tasksInNewColumn = getTasksByStatus(newStatus);
    const newPosition = tasksInNewColumn.length;
    
    updateTaskStatusMutation.mutate({
      taskId: selectedTask.id,
      status: newStatus,
      position: newPosition
    });
    
    setSelectedTask({ ...selectedTask, status: newStatus });
  };

  if (boardsLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-background">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,53,234,0.3),transparent_50%)] animate-pulse"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.3),transparent_50%)] animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
          <p className="relative z-10 text-lg text-white">Loading boards...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen relative overflow-hidden">
        {/* Dark theme background with animated gradients - matching main app */}
        <div className="absolute inset-0 bg-background">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,53,234,0.3),transparent_50%)] animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.3),transparent_50%)] animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(16,185,129,0.2),transparent_50%)] animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Kanban Boards</h1>
          
          <Dialog open={isCreateBoardOpen} onOpenChange={setIsCreateBoardOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-board" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 min-h-[44px] w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> New Board
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Board</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">Board Name</label>
                  <Input
                    data-testid="input-board-name"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    placeholder="My Project Board"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Textarea
                    data-testid="input-board-description"
                    value={newBoardDescription}
                    onChange={(e) => setNewBoardDescription(e.target.value)}
                    placeholder="Board description..."
                  />
                </div>
                <Button
                  data-testid="button-submit-board"
                  onClick={() => createBoardMutation.mutate({ name: newBoardName, description: newBoardDescription })}
                  disabled={!newBoardName || createBoardMutation.isPending}
                  className="w-full"
                >
                  {createBoardMutation.isPending ? "Creating..." : "Create Board"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {!boards || boards.length === 0 ? (
          <Card className="bg-gray-900/80 border-purple-500/30 backdrop-blur-glass text-center py-12">
            <CardContent>
              <p className="text-lg text-gray-400 mb-4">
                No boards yet. Create your first Kanban board to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 mb-4">
              {boards.map((board) => (
                <div key={board.id} className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    data-testid={`button-board-${board.id}`}
                    variant={selectedBoard === board.id ? "default" : "outline"}
                    onClick={() => setSelectedBoard(board.id)}
                    className={`flex-1 min-h-[44px] ${
                      selectedBoard === board.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none'
                        : 'bg-gray-800/50 border-purple-500/30 text-white hover:bg-gray-700/50 hover:border-purple-400/50'
                    }`}
                  >
                    {board.name}
                  </Button>
                  <Button
                    data-testid={`button-delete-board-${board.id}`}
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      if (confirm(`Delete board "${board.name}"?`)) {
                        deleteBoardMutation.mutate(board.id);
                      }
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 min-h-[44px] min-w-[44px]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {selectedBoard && !boardLoading && currentBoard && (
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">{currentBoard.name}</h2>
                    {currentBoard.description && (
                      <p className="text-gray-400 mt-1">{currentBoard.description}</p>
                    )}
                  </div>
                  
                  <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-create-task" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 min-h-[44px] w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" /> New Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <label className="text-sm font-medium">Task Title</label>
                          <Input
                            data-testid="input-task-title"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Task title"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description (Optional)</label>
                          <Textarea
                            data-testid="input-task-description"
                            value={newTaskDescription}
                            onChange={(e) => setNewTaskDescription(e.target.value)}
                            placeholder="Task description..."
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Status</label>
                          <select
                            data-testid="select-task-status"
                            value={newTaskStatus}
                            onChange={(e) => setNewTaskStatus(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2"
                          >
                            {KANBAN_COLUMNS.map(col => (
                              <option key={col.id} value={col.id}>{col.title}</option>
                            ))}
                          </select>
                        </div>
                        <Button
                          data-testid="button-submit-task"
                          onClick={() => createTaskMutation.mutate({
                            title: newTaskTitle,
                            description: newTaskDescription,
                            status: newTaskStatus
                          })}
                          disabled={!newTaskTitle || createTaskMutation.isPending}
                          className="w-full"
                        >
                          {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  {KANBAN_COLUMNS.map((column) => (
                    <div key={column.id} className="rounded-lg p-4 bg-gray-900/50 border border-gray-700/50 backdrop-blur-sm">
                      <h3 className="font-semibold text-lg mb-4 text-white flex items-center justify-between">
                        {column.title}
                        <span className="text-sm font-normal text-gray-400">
                          {getTasksByStatus(column.id).length}
                        </span>
                      </h3>
                      
                      <div className="space-y-3">
                        {getTasksByStatus(column.id).map((task) => {
                          const columnIndex = KANBAN_COLUMNS.findIndex(col => col.id === task.status);
                          const canMoveLeft = columnIndex > 0;
                          const canMoveRight = columnIndex < KANBAN_COLUMNS.length - 1;
                          
                          return (
                            <Card 
                              key={task.id} 
                              data-testid={`card-task-${task.id}`} 
                              className="bg-gray-800/80 border-gray-700/50 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all cursor-pointer"
                              onClick={() => openTaskDetails(task)}
                            >
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-1">
                                    <GripVertical className="h-4 w-4 text-gray-500" />
                                    <span className="text-white">{task.title}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      data-testid={`button-move-left-${task.id}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveTask(task, 'left');
                                      }}
                                      disabled={!canMoveLeft || updateTaskStatusMutation.isPending}
                                      className="text-purple-400 hover:text-purple-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                                      title="Move to previous column"
                                    >
                                      <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                      data-testid={`button-move-right-${task.id}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveTask(task, 'right');
                                      }}
                                      disabled={!canMoveRight || updateTaskStatusMutation.isPending}
                                      className="text-purple-400 hover:text-purple-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                                      title="Move to next column"
                                    >
                                      <ChevronRight className="h-4 w-4" />
                                    </button>
                                    <button
                                      data-testid={`button-delete-task-${task.id}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm(`Delete task "${task.title}"?`)) {
                                          deleteTaskMutation.mutate(task.id);
                                        }
                                      }}
                                      className="text-red-400 hover:text-red-300 transition-colors"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </CardTitle>
                              </CardHeader>
                              {task.description && (
                                <CardContent className="pt-0">
                                  <p className="text-sm text-gray-400 line-clamp-2">{task.description}</p>
                                </CardContent>
                              )}
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedBoard && boardLoading && (
              <div className="text-center py-12">
                <p className="text-lg text-gray-400">Loading board...</p>
              </div>
            )}

            {!selectedBoard && (
              <Card className="bg-gray-900/80 border-purple-500/30 backdrop-blur-glass text-center py-12">
                <CardContent>
                  <p className="text-lg text-gray-400">
                    Select a board to view and manage tasks
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>

    {/* Task Details Modal */}
    <Dialog open={isTaskDetailsOpen} onOpenChange={setIsTaskDetailsOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Task Details</span>
            {!isEditingTask ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingTask(true)}
                data-testid="button-edit-task"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditingTask(false);
                    if (selectedTask) {
                      setEditTaskTitle(selectedTask.title);
                      setEditTaskDescription(selectedTask.description || "");
                    }
                  }}
                  data-testid="button-cancel-edit"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveTask}
                  disabled={updateTaskMutation.isPending}
                  data-testid="button-save-task"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateTaskMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        
        {selectedTask && (
          <div className="space-y-4 pt-4">
            {/* Title */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
              {isEditingTask ? (
                <Input
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                  data-testid="input-edit-task-title"
                  className="mt-1"
                />
              ) : (
                <p className="text-lg font-semibold mt-1">{selectedTask.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
              {isEditingTask ? (
                <Textarea
                  value={editTaskDescription}
                  onChange={(e) => setEditTaskDescription(e.target.value)}
                  data-testid="input-edit-task-description"
                  className="mt-1"
                  rows={4}
                  placeholder="Add a description..."
                />
              ) : (
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {selectedTask.description || "No description"}
                </p>
              )}
            </div>

            {/* Status - Always editable */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Status
              </label>
              <select
                value={selectedTask.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                data-testid="select-task-status"
              >
                {KANBAN_COLUMNS.map(col => (
                  <option key={col.id} value={col.id}>{col.title}</option>
                ))}
              </select>
            </div>

            {/* Category - Editable */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Category
              </label>
              {isEditingTask ? (
                <Input
                  value={editTaskCategory}
                  onChange={(e) => setEditTaskCategory(e.target.value)}
                  placeholder="e.g., HTML, Foundation Phase"
                  className="mt-1"
                  data-testid="input-edit-task-category"
                />
              ) : (
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {selectedTask.category || "No category"}
                </p>
              )}
            </div>

            {/* Estimated Time - Editable */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Estimated Time
              </label>
              {isEditingTask ? (
                <Input
                  value={editTaskEstimatedTime}
                  onChange={(e) => setEditTaskEstimatedTime(e.target.value)}
                  placeholder="e.g., 5 hours, 2 weeks"
                  className="mt-1"
                  data-testid="input-edit-task-time"
                />
              ) : (
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {selectedTask.estimatedTime || "No time estimate"}
                </p>
              )}
            </div>

            {/* Resources - Editable */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Resources
              </label>
              {isEditingTask ? (
                <div className="mt-2 space-y-2">
                  {editTaskResources.map((resource, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={resource}
                        onChange={(e) => {
                          const newResources = [...editTaskResources];
                          newResources[index] = e.target.value;
                          setEditTaskResources(newResources);
                        }}
                        className="flex-1"
                        data-testid={`input-resource-${index}`}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveResource(index)}
                        data-testid={`button-remove-resource-${index}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newResource}
                      onChange={(e) => setNewResource(e.target.value)}
                      placeholder="Add resource URL..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddResource()}
                      data-testid="input-new-resource"
                    />
                    <Button
                      onClick={handleAddResource}
                      variant="outline"
                      size="sm"
                      data-testid="button-add-resource"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  {selectedTask.resources && selectedTask.resources.length > 0 ? (
                    selectedTask.resources.map((resource, index) => (
                      <a
                        key={index}
                        href={resource}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                        data-testid={`link-resource-${index}`}
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span className="text-sm truncate">{resource}</span>
                      </a>
                    ))
                  ) : (
                    <p className="text-slate-600 dark:text-slate-400 text-sm">No resources</p>
                  )}
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500 dark:text-slate-500 space-y-1">
                {selectedTask.createdAt && <p>Created: {new Date(selectedTask.createdAt).toLocaleString()}</p>}
                {selectedTask.updatedAt && <p>Updated: {new Date(selectedTask.updatedAt).toLocaleString()}</p>}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
