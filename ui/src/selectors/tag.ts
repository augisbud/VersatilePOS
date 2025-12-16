import { State } from '@/types/redux';
import { ModelsTagDto, ModelsTagEntitiesResponse } from '@/api/types.gen';

export const getTags = (state: State): ModelsTagDto[] => state.tag.tags;

export const getSelectedTag = (state: State) => state.tag.selectedTag;

export const getTagsBusinessId = (state: State) => state.tag.selectedBusinessId;

export const getTagsLoading = (state: State) => state.tag.loading;

export const getTagsError = (state: State) => state.tag.error;

export const getTagsLinkLoading = (state: State) => state.tag.linkLoading;

export const getTagsLinkError = (state: State) => state.tag.linkError;

export const getTagEntities = (
  state: State
): ModelsTagEntitiesResponse | undefined => state.tag.tagEntities;

export const getTagItems = (state: State): unknown[] => state.tag.tagItems;

export const getTagItemOptions = (state: State): unknown[] =>
  state.tag.tagItemOptions;

export const getTagServices = (state: State): unknown[] => state.tag.tagServices;

export const getTagsByItem = (state: State): ModelsTagDto[] => state.tag.tagsByItem;

export const getTagsByItemOption = (state: State): ModelsTagDto[] =>
  state.tag.tagsByItemOption;

export const getTagsByService = (state: State): ModelsTagDto[] =>
  state.tag.tagsByService;

export const getTagById = (tags: ModelsTagDto[], id: number) =>
  tags.find((t) => t.id === id);


