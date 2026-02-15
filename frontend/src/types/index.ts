// ==================== User ====================
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  createdAt?: string;
}

// ==================== Workspace ====================
export interface Workspace {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  ownerId: string;
  boards: Board[];
  members: WorkspaceMember[];
  _count?: { boards: number; members: number };
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  user: User;
  role: string;
  joinedAt: string;
}

// ==================== Board ====================
export interface Board {
  id: string;
  title: string;
  description: string | null;
  color: string;
  ownerId: string;
  workspaceId?: string | null;
  owner: User;
  members: BoardMember[];
  lists: List[];
  labels: Label[];
  _count?: { lists: number };
  createdAt: string;
  updatedAt: string;
}

export interface BoardMember {
  id: string;
  boardId: string;
  userId: string;
  role: string;
  user: User;
  joinedAt: string;
}

// ==================== List ====================
export interface List {
  id: string;
  title: string;
  position: number;
  boardId: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

// ==================== Task ====================
export interface Task {
  id: string;
  title: string;
  description: string | null;
  position: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string | null;
  listId: string;
  assignees: TaskAssignee[];
  labels: TaskLabelJoin[];
  comments?: Comment[];
  _count?: { comments: number };
  list?: { id: string; title: string; boardId: string };
  createdAt: string;
  updatedAt: string;
}

export interface TaskAssignee {
  id: string;
  taskId: string;
  userId: string;
  user: User;
  assignedAt: string;
}

export interface TaskLabelJoin {
  id: string;
  taskId: string;
  labelId: string;
  label: Label;
}

// ==================== Label ====================
export interface Label {
  id: string;
  name: string;
  color: string;
  boardId: string;
  _count?: { tasks: number };
}

// ==================== Comment ====================
export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

// ==================== Activity ====================
export interface Activity {
  id: string;
  type: string;
  description: string;
  boardId: string;
  userId: string;
  taskId: string | null;
  user: User;
  task?: { id: string; title: string } | null;
  metadata?: string;
  createdAt: string;
}

// ==================== Invitation ====================
export interface Invitation {
  id: string;
  boardId: string;
  inviterId: string;
  inviteeEmail: string;
  role: string;
  status: string;
  token: string;
  board: { id: string; title: string; color?: string };
  inviter: User;
  createdAt: string;
  expiresAt: string;
}

// ==================== API Response ====================
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ==================== Board with Pagination ====================
export interface BoardsResponse {
  boards: Board[];
  pagination: Pagination;
}

export interface ActivitiesResponse {
  activities: Activity[];
  pagination: Pagination;
}
