import { createReducer } from '@reduxjs/toolkit';
import {
  addTag,
  editTag,
  fetchTagById,
  fetchTagEntities,
  fetchTagItemOptions,
  fetchTagItems,
  fetchTagServices,
  fetchTags,
  fetchTagsByItem,
  fetchTagsByItemOption,
  fetchTagsByService,
  linkItemOptionToTag,
  linkItemToTag,
  linkServiceToTag,
  removeTag,
  setTagsBusinessId,
  unlinkItemFromTag,
  unlinkItemOptionFromTag,
  unlinkServiceFromTag,
} from '@/actions/tag';
import { ModelsTagDto, ModelsTagEntitiesResponse } from '@/api/types.gen';

export interface TagState {
  tags: ModelsTagDto[];
  selectedTag?: ModelsTagDto;
  selectedBusinessId?: number;

  tagEntities?: ModelsTagEntitiesResponse;
  tagItems: unknown[];
  tagItemOptions: unknown[];
  tagServices: unknown[];

  tagsByItem: ModelsTagDto[];
  tagsByItemOption: ModelsTagDto[];
  tagsByService: ModelsTagDto[];

  loading: boolean;
  linkLoading: boolean;
  error?: string;
  linkError?: string;
}

const initialState: TagState = {
  tags: [],
  selectedTag: undefined,
  selectedBusinessId: undefined,

  tagEntities: undefined,
  tagItems: [],
  tagItemOptions: [],
  tagServices: [],

  tagsByItem: [],
  tagsByItemOption: [],
  tagsByService: [],

  loading: false,
  linkLoading: false,
};

export const tagReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setTagsBusinessId, (state, { payload }) => {
      state.selectedBusinessId = payload;
      state.tags = [];
      state.selectedTag = undefined;
      state.tagEntities = undefined;
      state.tagItems = [];
      state.tagItemOptions = [];
      state.tagServices = [];
      state.tagsByItem = [];
      state.tagsByItemOption = [];
      state.tagsByService = [];
      state.error = undefined;
      state.linkError = undefined;
    })
    // Fetch tags
    .addCase(fetchTags.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchTags.fulfilled, (state, { payload }) => {
      state.tags = payload;
      state.loading = false;
    })
    .addCase(fetchTags.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Fetch tag by id
    .addCase(fetchTagById.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchTagById.fulfilled, (state, { payload }) => {
      state.selectedTag = payload;
      state.loading = false;
    })
    .addCase(fetchTagById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Add tag
    .addCase(addTag.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(addTag.fulfilled, (state, { payload }) => {
      state.tags.push(payload);
      state.loading = false;
    })
    .addCase(addTag.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Edit tag
    .addCase(editTag.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(editTag.fulfilled, (state, { payload }) => {
      state.tags = state.tags.map((t) => (t.id === payload.id ? payload : t));
      state.selectedTag =
        state.selectedTag?.id === payload.id ? payload : state.selectedTag;
      state.loading = false;
    })
    .addCase(editTag.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Remove tag
    .addCase(removeTag.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(removeTag.fulfilled, (state, { payload }) => {
      state.tags = state.tags.filter((t) => t.id !== payload);
      if (state.selectedTag?.id === payload) {
        state.selectedTag = undefined;
      }
      state.loading = false;
    })
    .addCase(removeTag.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Fetch tag entities
    .addCase(fetchTagEntities.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchTagEntities.fulfilled, (state, { payload }) => {
      state.tagEntities = payload;
      state.loading = false;
    })
    .addCase(fetchTagEntities.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Fetch tag items
    .addCase(fetchTagItems.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchTagItems.fulfilled, (state, { payload }) => {
      state.tagItems = payload;
      state.loading = false;
    })
    .addCase(fetchTagItems.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Fetch tag item options
    .addCase(fetchTagItemOptions.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchTagItemOptions.fulfilled, (state, { payload }) => {
      state.tagItemOptions = payload;
      state.loading = false;
    })
    .addCase(fetchTagItemOptions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Fetch tag services
    .addCase(fetchTagServices.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchTagServices.fulfilled, (state, { payload }) => {
      state.tagServices = payload;
      state.loading = false;
    })
    .addCase(fetchTagServices.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Fetch tags by item
    .addCase(fetchTagsByItem.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchTagsByItem.fulfilled, (state, { payload }) => {
      state.tagsByItem = payload;
      state.loading = false;
    })
    .addCase(fetchTagsByItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Fetch tags by item option
    .addCase(fetchTagsByItemOption.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchTagsByItemOption.fulfilled, (state, { payload }) => {
      state.tagsByItemOption = payload;
      state.loading = false;
    })
    .addCase(fetchTagsByItemOption.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Fetch tags by service
    .addCase(fetchTagsByService.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchTagsByService.fulfilled, (state, { payload }) => {
      state.tagsByService = payload;
      state.loading = false;
    })
    .addCase(fetchTagsByService.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Link / unlink operations (use separate loading/error flags)
    .addCase(linkItemToTag.pending, (state) => {
      state.linkLoading = true;
      state.linkError = undefined;
    })
    .addCase(linkItemToTag.fulfilled, (state) => {
      state.linkLoading = false;
    })
    .addCase(linkItemToTag.rejected, (state, action) => {
      state.linkLoading = false;
      state.linkError = action.error.message;
    })
    .addCase(unlinkItemFromTag.pending, (state) => {
      state.linkLoading = true;
      state.linkError = undefined;
    })
    .addCase(unlinkItemFromTag.fulfilled, (state) => {
      state.linkLoading = false;
    })
    .addCase(unlinkItemFromTag.rejected, (state, action) => {
      state.linkLoading = false;
      state.linkError = action.error.message;
    })
    .addCase(linkItemOptionToTag.pending, (state) => {
      state.linkLoading = true;
      state.linkError = undefined;
    })
    .addCase(linkItemOptionToTag.fulfilled, (state) => {
      state.linkLoading = false;
    })
    .addCase(linkItemOptionToTag.rejected, (state, action) => {
      state.linkLoading = false;
      state.linkError = action.error.message;
    })
    .addCase(unlinkItemOptionFromTag.pending, (state) => {
      state.linkLoading = true;
      state.linkError = undefined;
    })
    .addCase(unlinkItemOptionFromTag.fulfilled, (state) => {
      state.linkLoading = false;
    })
    .addCase(unlinkItemOptionFromTag.rejected, (state, action) => {
      state.linkLoading = false;
      state.linkError = action.error.message;
    })
    .addCase(linkServiceToTag.pending, (state) => {
      state.linkLoading = true;
      state.linkError = undefined;
    })
    .addCase(linkServiceToTag.fulfilled, (state) => {
      state.linkLoading = false;
    })
    .addCase(linkServiceToTag.rejected, (state, action) => {
      state.linkLoading = false;
      state.linkError = action.error.message;
    })
    .addCase(unlinkServiceFromTag.pending, (state) => {
      state.linkLoading = true;
      state.linkError = undefined;
    })
    .addCase(unlinkServiceFromTag.fulfilled, (state) => {
      state.linkLoading = false;
    })
    .addCase(unlinkServiceFromTag.rejected, (state, action) => {
      state.linkLoading = false;
      state.linkError = action.error.message;
    });
});


