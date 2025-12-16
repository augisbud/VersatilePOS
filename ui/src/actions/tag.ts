import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import {
  ModelsCreateTagRequest,
  ModelsLinkItemOptionRequest,
  ModelsLinkItemRequest,
  ModelsLinkServiceRequest,
  ModelsTagDto,
  ModelsTagEntitiesResponse,
  ModelsUpdateTagRequest,
} from '@/api/types.gen';
import {
  deleteTagById,
  deleteTagByIdItemByItemId,
  deleteTagByIdItemOptionByItemOptionId,
  deleteTagByIdServiceByServiceId,
  getTag,
  getTagById,
  getTagByIdEntities,
  getTagByIdItemOptions,
  getTagByIdItems,
  getTagByIdServices,
  getTagItemByItemId,
  getTagItemOptionByItemOptionId,
  getTagServiceByServiceId,
  postTag,
  postTagByIdItem,
  postTagByIdItemOption,
  postTagByIdService,
  putTagById,
} from '@/api';

export const setTagsBusinessId = createAction<number>('tag/setTagsBusinessId');

export const fetchTags = createAsyncThunk<ModelsTagDto[], number>(
  'tag/fetchTags',
  async (businessId: number) => {
    const response = await getTag({ query: { businessId } });
    if (response.error) {
      throw new Error(response.error.error);
    }
    return Array.isArray(response.data) ? response.data : [];
  }
);

export const fetchTagById = createAsyncThunk<ModelsTagDto, number>(
  'tag/fetchTagById',
  async (tagId: number) => {
    const response = await getTagById({ path: { id: tagId } });
    if (response.error) {
      throw new Error(response.error.error);
    }
    if (!response.data) {
      throw new Error('No data returned from getTagById');
    }
    return response.data;
  }
);

export const addTag = createAsyncThunk<ModelsTagDto, ModelsCreateTagRequest>(
  'tag/addTag',
  async (tagData: ModelsCreateTagRequest) => {
    const response = await postTag({ body: tagData });
    if (response.error) {
      throw new Error(response.error.error);
    }
    if (!response.data) {
      throw new Error('No data returned from postTag');
    }
    return response.data;
  }
);

export const editTag = createAsyncThunk<
  ModelsTagDto,
  { id: number; data: ModelsUpdateTagRequest }
>('tag/editTag', async ({ id, data }) => {
  const response = await putTagById({ path: { id }, body: data });
  if (response.error) {
    throw new Error(response.error.error);
  }
  if (!response.data) {
    throw new Error('No data returned from putTagById');
  }
  return response.data;
});

export const removeTag = createAsyncThunk<number, number>(
  'tag/removeTag',
  async (tagId: number) => {
    const response = await deleteTagById({ path: { id: tagId } });
    if (response.error) {
      throw new Error(response.error.error);
    }
    return tagId;
  }
);

export const fetchTagEntities = createAsyncThunk<
  ModelsTagEntitiesResponse,
  number
>('tag/fetchTagEntities', async (tagId: number) => {
  const response = await getTagByIdEntities({ path: { id: tagId } });
  if (response.error) {
    throw new Error(response.error.error);
  }
  if (!response.data) {
    throw new Error('No data returned from getTagByIdEntities');
  }
  return response.data;
});

// Swagger/openapi currently types these as `object[]` / `unknown[]`.
// Backend returns item/item-option/service-like objects; keep these as `unknown[]` in redux.
export const fetchTagItems = createAsyncThunk<unknown[], number>(
  'tag/fetchTagItems',
  async (tagId: number) => {
    const response = await getTagByIdItems({ path: { id: tagId } });
    if (response.error) {
      throw new Error(response.error.error);
    }
    return Array.isArray(response.data) ? response.data : [];
  }
);

export const fetchTagItemOptions = createAsyncThunk<unknown[], number>(
  'tag/fetchTagItemOptions',
  async (tagId: number) => {
    const response = await getTagByIdItemOptions({ path: { id: tagId } });
    if (response.error) {
      throw new Error(response.error.error);
    }
    return Array.isArray(response.data) ? response.data : [];
  }
);

export const fetchTagServices = createAsyncThunk<unknown[], number>(
  'tag/fetchTagServices',
  async (tagId: number) => {
    const response = await getTagByIdServices({ path: { id: tagId } });
    if (response.error) {
      throw new Error(response.error.error);
    }
    return Array.isArray(response.data) ? response.data : [];
  }
);

export const fetchTagsByItem = createAsyncThunk<ModelsTagDto[], number>(
  'tag/fetchTagsByItem',
  async (itemId: number) => {
    const response = await getTagItemByItemId({ path: { itemId } });
    if (response.error) {
      throw new Error(response.error.error);
    }
    return Array.isArray(response.data) ? response.data : [];
  }
);

export const fetchTagsByItemOption = createAsyncThunk<ModelsTagDto[], number>(
  'tag/fetchTagsByItemOption',
  async (itemOptionId: number) => {
    const response = await getTagItemOptionByItemOptionId({
      path: { itemOptionId },
    });
    if (response.error) {
      throw new Error(response.error.error);
    }
    return Array.isArray(response.data) ? response.data : [];
  }
);

export const fetchTagsByService = createAsyncThunk<ModelsTagDto[], number>(
  'tag/fetchTagsByService',
  async (serviceId: number) => {
    const response = await getTagServiceByServiceId({ path: { serviceId } });
    if (response.error) {
      throw new Error(response.error.error);
    }
    return Array.isArray(response.data) ? response.data : [];
  }
);

export const linkItemToTag = createAsyncThunk<
  void,
  { tagId: number; itemId: number }
>('tag/linkItemToTag', async ({ tagId, itemId }) => {
  const body: ModelsLinkItemRequest = { itemId };
  const response = await postTagByIdItem({ path: { id: tagId }, body });
  if (response.error) {
    throw new Error(response.error.error);
  }
});

export const unlinkItemFromTag = createAsyncThunk<
  void,
  { tagId: number; itemId: number }
>('tag/unlinkItemFromTag', async ({ tagId, itemId }) => {
  const response = await deleteTagByIdItemByItemId({
    path: { id: tagId, itemId },
  });
  if (response.error) {
    throw new Error(response.error.error);
  }
});

export const linkItemOptionToTag = createAsyncThunk<
  void,
  { tagId: number; itemOptionId: number }
>('tag/linkItemOptionToTag', async ({ tagId, itemOptionId }) => {
  const body: ModelsLinkItemOptionRequest = { itemOptionId };
  const response = await postTagByIdItemOption({ path: { id: tagId }, body });
  if (response.error) {
    throw new Error(response.error.error);
  }
});

export const unlinkItemOptionFromTag = createAsyncThunk<
  void,
  { tagId: number; itemOptionId: number }
>('tag/unlinkItemOptionFromTag', async ({ tagId, itemOptionId }) => {
  const response = await deleteTagByIdItemOptionByItemOptionId({
    path: { id: tagId, itemOptionId },
  });
  if (response.error) {
    throw new Error(response.error.error);
  }
});

export const linkServiceToTag = createAsyncThunk<
  void,
  { tagId: number; serviceId: number }
>('tag/linkServiceToTag', async ({ tagId, serviceId }) => {
  const body: ModelsLinkServiceRequest = { serviceId };
  const response = await postTagByIdService({ path: { id: tagId }, body });
  if (response.error) {
    throw new Error(response.error.error);
  }
});

export const unlinkServiceFromTag = createAsyncThunk<
  void,
  { tagId: number; serviceId: number }
>('tag/unlinkServiceFromTag', async ({ tagId, serviceId }) => {
  const response = await deleteTagByIdServiceByServiceId({
    path: { id: tagId, serviceId },
  });
  if (response.error) {
    throw new Error(response.error.error);
  }
});
