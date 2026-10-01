import resourceData from './resources.json';
import taskData from './tasks.json';
import type { Resource, Task } from '../types';
export const resources = resourceData as Resource[];
export const tasks = taskData as Task[];
export const resourceById = new Map(resources.map(resource => [resource.id, resource]));
