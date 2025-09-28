





export enum BlockType {
  PARAGRAPH = 'PARAGRAPH',
  HEADING = 'HEADING', 
  LIST = 'LIST',
  DIVIDER = 'DIVIDER',
  CODE = 'CODE',
  QUOTE = 'QUOTE'
}

export enum MemberRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export enum MessageType {
  TEXT = 'TEXT',
  FILE = 'FILE'
}

export enum FriendRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED'
}

export enum NotificationType {
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  GROUP_INVITE = 'GROUP_INVITE',
  MESSAGE = 'MESSAGE',
  MENTION = 'MENTION'
}

export enum DirectMessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE'
}

export interface User {
  id: string
  email: string
  username: string
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface Group {
  id: string
  name: string
  description?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
  creator?: User
  members?: GroupMember[]
  _count?: {
    members: number
    messages: number
  }
}

export interface GroupMember {
  id: string
  groupId: string
  userId: string
  role: MemberRole
  joinedAt: Date
  user?: User
  group?: Group
}

export interface Message {
  id: string
  groupId: string
  userId: string
  content: string
  messageType: MessageType
  fileUrl?: string
  createdAt: Date
  user?: User
}

export interface Note {
  id: string
  groupId: string
  title: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
  creator?: User
  blocks?: NoteBlock[]
}

export interface NoteBlock {
  id: string
  noteId: string
  blockType: BlockType
  content: any
  position: number
  createdAt: Date
  updatedAt: Date
}


export interface ParagraphContent {
  text: string
}

export interface HeadingContent {
  text: string
  level: 1 | 2 | 3
}

export interface Friendship {
  id: string
  userId: string
  friendId: string
  createdAt: Date
  user?: User
  friend?: User
}

export interface FriendRequest {
  id: string
  fromUserId: string
  toUserId: string
  status: FriendRequestStatus
  createdAt: Date
  updatedAt: Date
  fromUser: User
  toUser: User
}

export interface Notification {
  id: string
  type: NotificationType
  message: string
  read: boolean
  createdAt: Date
  senderId: string
  recipientId: string
  sender: User
}

export interface DirectMessage {
  id: string
  type: DirectMessageType
  content: string
  senderId: string
  receiverId: string
  read: boolean
  createdAt: Date
  updatedAt: Date
  sender: User
  receiver: User
}

export interface ListContent {
  items: string[]
  type: 'ordered' | 'unordered'
}

export interface CodeContent {
  code: string
  language?: string
}

export interface QuoteContent {
  text: string
  author?: string
}