import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, GripVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KanbanTask {
  id: number;
  boardId: number;
  title: string;
  description: string | null;
  status: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

interface KanbanBoard {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  tasks?: KanbanTask[];
}

const KANBAN_COLUMNS = [
  { id: "todo", title: "To Do", color: "bg-slate-100 dark:bg-slate-800" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-50 dark:bg-blue-900/20" },
  { id: "done", title: "Done", color: "bg-green-50 dark:bg-green-900/20" }
];

export default function KanbanBoardPage() {
  const { toast } = useToast();
  const [selectedBoard, setSelectedBoard] = useState<number | null>(null);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState("todo");
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

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

  if (boardsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center">
        <p className="text-lg text-slate-600 dark:text-slate-400">Loading boards...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Kanban Boards</h1>
          
          <Dialog open={isCreateBoardOpen} onOpenChange={setIsCreateBoardOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-board" className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
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
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
                No boards yet. Create your first Kanban board to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {boards.map((board) => (
                <Button
                  key={board.id}
                  data-testid={`button-board-${board.id}`}
                  variant={selectedBoard === board.id ? "default" : "outline"}
                  onClick={() => setSelectedBoard(board.id)}
                  className="flex items-center gap-2"
                >
                  {board.name}
                  <button
                    data-testid={`button-delete-board-${board.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete board "${board.name}"?`)) {
                        deleteBoardMutation.mutate(board.id);
                      }
                    }}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </Button>
              ))}
            </div>

            {selectedBoard && !boardLoading && currentBoard && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{currentBoard.name}</h2>
                    {currentBoard.description && (
                      <p className="text-slate-600 dark:text-slate-400 mt-1">{currentBoard.description}</p>
                    )}
                  </div>
                  
                  <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-create-task" variant="outline">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {KANBAN_COLUMNS.map((column) => (
                    <div key={column.id} className={`rounded-lg p-4 ${column.color}`}>
                      <h3 className="font-semibold text-lg mb-4 text-slate-900 dark:text-white flex items-center justify-between">
                        {column.title}
                        <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
                          {getTasksByStatus(column.id).length}
                        </span>
                      </h3>
                      
                      <div className="space-y-2">
                        {getTasksByStatus(column.id).map((task) => {
                          const columnIndex = KANBAN_COLUMNS.findIndex(col => col.id === task.status);
                          const canMoveLeft = columnIndex > 0;
                          const canMoveRight = columnIndex < KANBAN_COLUMNS.length - 1;
                          
                          return (
                            <Card key={task.id} data-testid={`card-task-${task.id}`} className="hover:shadow-md transition-shadow">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-1">
                                    <GripVertical className="h-4 w-4 text-slate-400" />
                                    <span>{task.title}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      data-testid={`button-move-left-${task.id}`}
                                      onClick={() => moveTask(task, 'left')}
                                      disabled={!canMoveLeft || updateTaskStatusMutation.isPending}
                                      className="text-blue-500 hover:text-blue-700 disabled:text-slate-300 disabled:cursor-not-allowed"
                                      title="Move to previous column"
                                    >
                                      <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                      data-testid={`button-move-right-${task.id}`}
                                      onClick={() => moveTask(task, 'right')}
                                      disabled={!canMoveRight || updateTaskStatusMutation.isPending}
                                      className="text-blue-500 hover:text-blue-700 disabled:text-slate-300 disabled:cursor-not-allowed"
                                      title="Move to next column"
                                    >
                                      <ChevronRight className="h-4 w-4" />
                                    </button>
                                    <button
                                      data-testid={`button-delete-task-${task.id}`}
                                      onClick={() => {
                                        if (confirm(`Delete task "${task.title}"?`)) {
                                          deleteTaskMutation.mutate(task.id);
                                        }
                                      }}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </CardTitle>
                              </CardHeader>
                              {task.description && (
                                <CardContent className="pt-0">
                                  <p className="text-sm text-slate-600 dark:text-slate-400">{task.description}</p>
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
                <p className="text-lg text-slate-600 dark:text-slate-400">Loading board...</p>
              </div>
            )}

            {!selectedBoard && (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-lg text-slate-600 dark:text-slate-400">
                    Select a board to view and manage tasks
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
