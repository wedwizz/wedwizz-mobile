import { apiClient } from "@wedwizz/core/api/api-client";
import type { ApiSuccess, Checklist, ChecklistTask, ChecklistTaskPatch, Favourite, NewChecklistTaskPayload } from "@wedwizz/core/api/types";

interface RequestOptions {
  signal?: AbortSignal;
}

const favouritePath = (slug: string) => `/me/favourites/${encodeURIComponent(slug)}`;
const taskPath = (taskId: string) => `/me/checklist/tasks/${encodeURIComponent(taskId)}`;

/** `GET /me/favourites`: saved venues and vendors, newest first; `listing` is null once one is no longer public. */
export async function listFavourites(options: RequestOptions = {}): Promise<Favourite[]> {
  const { data } = await apiClient.get<ApiSuccess<{ favourites: Favourite[] }>>("/me/favourites", { signal: options.signal });
  return data.data.favourites;
}

/** `PUT /me/favourites/:slug`: saves a public listing; repeating it is harmless. 404 when not public; 409 when full. */
export async function saveFavourite(slug: string): Promise<Favourite> {
  const { data } = await apiClient.put<ApiSuccess<{ favourite: Favourite }>>(favouritePath(slug));
  return data.data.favourite;
}

/** `DELETE /me/favourites/:slug`: repeating it is harmless. */
export async function removeFavourite(slug: string): Promise<void> {
  await apiClient.delete(favouritePath(slug));
}

/** `GET /me/checklist`: the tasks with their due dates; the first call gives a new customer the default tasks. */
export async function getChecklist(options: RequestOptions = {}): Promise<Checklist> {
  const { data } = await apiClient.get<ApiSuccess<Checklist>>("/me/checklist", { signal: options.signal });
  return data.data;
}

/** `POST /me/checklist/tasks`. 409 when the checklist is full. */
export async function createChecklistTask(task: NewChecklistTaskPayload): Promise<ChecklistTask> {
  const { data } = await apiClient.post<ApiSuccess<{ task: ChecklistTask }>>("/me/checklist/tasks", task);
  return data.data.task;
}

/** `PATCH /me/checklist/tasks/:id`: any of the fields; `dueDate: null` follows the wedding date again. */
export async function updateChecklistTask(taskId: string, patch: ChecklistTaskPatch): Promise<ChecklistTask> {
  const { data } = await apiClient.patch<ApiSuccess<{ task: ChecklistTask }>>(taskPath(taskId), patch);
  return data.data.task;
}

/** `DELETE /me/checklist/tasks/:id`. */
export async function deleteChecklistTask(taskId: string): Promise<void> {
  await apiClient.delete(taskPath(taskId));
}
