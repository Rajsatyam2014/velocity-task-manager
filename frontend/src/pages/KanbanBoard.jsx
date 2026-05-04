import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { Plus, Calendar, Trash2, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const PriorityBadge = ({ priority }) => {
  const colors = {
    HIGH: 'text-secondary bg-secondary/10 border-secondary/30',
    MEDIUM: 'text-accent bg-accent/10 border-accent/30',
    LOW: 'text-muted bg-white/5 border-white/10'
  };
  return (
    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${colors[priority] || colors.LOW}`}>
      {priority}
    </span>
  );
};

const DueBadge = ({ dueDate }) => {
  if (!dueDate) return <span className="text-[11px] text-muted">No due date</span>;
  const now = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

  let color = '#8080a0';
  let label = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  if (diffDays < 0) {
    color = '#ff003c';
    label = `${Math.abs(diffDays)}d overdue`;
  } else if (diffDays === 0) {
    color = '#ff003c';
    label = 'Due today';
  } else if (diffDays <= 3) {
    color = '#ffaa00';
    label = `Due in ${diffDays}d`;
  }

  return (
    <div className="flex items-center space-x-1" style={{ color }}>
      <Calendar className="w-3.5 h-3.5" />
      <span className="text-[11px] font-medium">{label}</span>
    </div>
  );
};

const KanbanBoard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [data, setData] = useState({ tasks: {}, columns: {}, columnOrder: [] });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Task Creation Modal State
  const [assigneeList, setAssigneeList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'LOW', dueDate: '' });

  const fetchBoardData = async () => {
    try {
      const projRes = await api.get(`/projects/${projectId}`);
      // Fetch users for assignment
      const usersRes = await api.get('/users');
      setUsers(usersRes.data);
      setAssigneeList(usersRes.data);
      setProject(projRes.data);

      const tasksRes = await api.get(`/tasks/project/${projectId}`);
      const rawTasks = tasksRes.data;

      const tasks = {};
      rawTasks.forEach(t => {
        tasks[t.id.toString()] = { 
          id: t.id.toString(), 
          content: t.title,
          description: t.description || '',
          priority: t.priority, 
          dueDate: t.dueDate || null,
          assignee: t.user?.name || null,
        };
      });

      const columns = {
        'TODO': { id: 'TODO', title: 'To Do', taskIds: rawTasks.filter(t => t.status === 'TODO').map(t => t.id.toString()) },
        'IN_PROGRESS': { id: 'IN_PROGRESS', title: 'In Progress', taskIds: rawTasks.filter(t => t.status === 'IN_PROGRESS').map(t => t.id.toString()) },
        'TESTING': { id: 'TESTING', title: 'Testing', taskIds: rawTasks.filter(t => t.status === 'TESTING').map(t => t.id.toString()) },
        'DONE': { id: 'DONE', title: 'Done', taskIds: rawTasks.filter(t => t.status === 'DONE').map(t => t.id.toString()) },
      };

      setData({
        tasks,
        columns,
        columnOrder: ['TODO', 'IN_PROGRESS', 'TESTING', 'DONE']
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching board data', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchBoardData();
  }, [projectId]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...start, taskIds: newTaskIds };
      setData({ ...data, columns: { ...data.columns, [newColumn.id]: newColumn } });
      return;
    }

    // Moving from one list to another
    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = { ...start, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finish, taskIds: finishTaskIds };

    // Optimistic UI update
    setData({
      ...data,
      columns: { ...data.columns, [newStart.id]: newStart, [newFinish.id]: newFinish },
    });

    // API update
    try {
      await api.put(`/tasks/${draggableId}`, { status: destination.droppableId });
    } catch (error) {
      console.error('Error updating task status', error);
      fetchBoardData(); // revert on fail
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    try {
      await api.post('/tasks', { 
        title: newTask.title,
        description: newTask.description || undefined,
        priority: newTask.priority,
        dueDate: newTask.dueDate || undefined,
        projectId,
        assignedTo: newTask.assigneeId || undefined
      });
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', priority: 'LOW', dueDate: '', assigneeId: '' });
      fetchBoardData();
    } catch (error) {
      console.error('Error creating task', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchBoardData();
    } catch (error) {
      console.error('Error deleting task', error);
    }
  };

  if (loading) return <div className="text-primary animate-pulse">Loading Quantum Board...</div>;

  return (
    <div className="h-[calc(100vh-13rem)] flex flex-col">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/projects')}
            className="p-2 rounded-xl text-muted hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-primary">{project?.name || 'Project'}</h1>
            <p className="text-muted text-sm">{project?.description || 'Active Sprint'}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-primary hover:bg-primary/80 text-background px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all font-bold text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>ADD TASK</span>
        </button>
      </div>

      {/* Task Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass-card w-full max-w-md p-8 relative"
          >
            <h2 className="text-2xl font-bold mb-6 text-primary">Initialize New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Task Title</label>
                <input 
                  type="text" 
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-white transition-colors"
                  placeholder="e.g. Implement Quantum DB Sync"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Description (Optional)</label>
                <textarea 
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-white transition-colors h-20 resize-none"
                  placeholder="Add task details..."
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Priority</label>
                  <select 
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-white transition-colors"
                  >
                    <option value="LOW" className="bg-[#14141e]">Low</option>
                    <option value="MEDIUM" className="bg-[#14141e]">Medium</option>
                    <option value="HIGH" className="bg-[#14141e]">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Due Date</label>
                  <input 
                    type="date" 
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-white transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-muted mb-1">Assign To</label>
                  <select 
                    value={newTask.assigneeId}
                    onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-white transition-colors"
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-xl text-muted hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/80 text-background font-bold px-6 py-2 rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all"
                >
                  Create Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Kanban Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden min-h-0">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex space-x-5 h-full items-start pb-4">
            {data.columnOrder.map((columnId) => {
              const column = data.columns[columnId];
              const tasks = column.taskIds.map(taskId => data.tasks[taskId]).filter(Boolean);

              return (
                <div key={column.id} className="w-72 min-w-[18rem] glass rounded-2xl p-4 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-4 px-2 shrink-0">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${column.title === 'Done' ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]' : column.title === 'In Progress' ? 'bg-primary shadow-[0_0_6px_rgba(0,240,255,0.8)]' : column.title === 'Testing' ? 'bg-accent shadow-[0_0_6px_rgba(157,0,255,0.8)]' : 'bg-white/30'}`}></div>
                      <h2 className="font-bold text-sm">{column.title}</h2>
                      <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-muted">{tasks.length}</span>
                    </div>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar min-h-0 ${snapshot.isDraggingOver ? 'bg-white/5 rounded-xl p-1' : ''}`}
                      >
                        {tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`glass-card !p-4 !rounded-xl transition-shadow group ${snapshot.isDragging ? 'shadow-[0_0_20px_rgba(0,240,255,0.3)] border-primary' : 'hover:border-white/30'}`}
                                style={{ ...provided.draggableProps.style }}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <PriorityBadge priority={task.priority} />
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                                    className="opacity-0 group-hover:opacity-100 text-muted hover:text-secondary transition-all p-1 rounded-lg hover:bg-secondary/10"
                                    title="Delete task"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <p className="text-sm font-medium mb-1">{task.content}</p>
                                {task.description && (
                                  <p className="text-xs text-muted mb-2 line-clamp-2">{task.description}</p>
                                )}
                                
                                <div className="flex justify-between items-center text-xs text-muted mt-3 pt-3 border-t border-white/10">
                                  <DueBadge dueDate={task.dueDate} />
                                  {task.assignee && (
                                    <div className="flex items-center space-x-2">
                                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee}&backgroundColor=14141e`} className="w-6 h-6 rounded-full bg-surface border border-white/20" alt="avatar" />
                                      <span className="text-[11px]">{task.assignee.split(' ')[0]}</span>
                                    </div>
                                  )}
                                </div>
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
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default KanbanBoard;
