import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import {
  getSelectedTag,
  getTagEntities,
  getTagItemOptions,
  getTagItems,
  getTagServices,
  getTags,
  getTagsBusinessId,
  getTagsByItem,
  getTagsByItemOption,
  getTagsByService,
  getTagsError,
  getTagsLinkError,
  getTagsLinkLoading,
  getTagsLoading,
  getTagById as getTagByIdSelector,
} from '@/selectors/tag';
import {
  addTag as addTagAction,
  editTag as editTagAction,
  fetchTagById as fetchTagByIdAction,
  fetchTagEntities as fetchTagEntitiesAction,
  fetchTagItemOptions as fetchTagItemOptionsAction,
  fetchTagItems as fetchTagItemsAction,
  fetchTagServices as fetchTagServicesAction,
  fetchTags as fetchTagsAction,
  fetchTagsByItem as fetchTagsByItemAction,
  fetchTagsByItemOption as fetchTagsByItemOptionAction,
  fetchTagsByService as fetchTagsByServiceAction,
  linkItemOptionToTag as linkItemOptionToTagAction,
  linkItemToTag as linkItemToTagAction,
  linkServiceToTag as linkServiceToTagAction,
  removeTag as removeTagAction,
  setTagsBusinessId,
  unlinkItemFromTag as unlinkItemFromTagAction,
  unlinkItemOptionFromTag as unlinkItemOptionFromTagAction,
  unlinkServiceFromTag as unlinkServiceFromTagAction,
} from '@/actions/tag';
import { ModelsCreateTagRequest, ModelsUpdateTagRequest } from '@/api/types.gen';

export const useTags = () => {
  const dispatch = useAppDispatch();

  const tags = useAppSelector(getTags);
  const selectedTag = useAppSelector(getSelectedTag);
  const selectedBusinessId = useAppSelector(getTagsBusinessId);

  const tagEntities = useAppSelector(getTagEntities);
  const tagItems = useAppSelector(getTagItems);
  const tagItemOptions = useAppSelector(getTagItemOptions);
  const tagServices = useAppSelector(getTagServices);

  const tagsByItem = useAppSelector(getTagsByItem);
  const tagsByItemOption = useAppSelector(getTagsByItemOption);
  const tagsByService = useAppSelector(getTagsByService);

  const loading = useAppSelector(getTagsLoading);
  const linkLoading = useAppSelector(getTagsLinkLoading);
  const error = useAppSelector(getTagsError);
  const linkError = useAppSelector(getTagsLinkError);

  const fetchTags = async (businessId: number) => {
    dispatch(setTagsBusinessId(businessId));
    return dispatch(fetchTagsAction(businessId)).unwrap();
  };

  const fetchTagById = async (tagId: number) => {
    return dispatch(fetchTagByIdAction(tagId)).unwrap();
  };

  const createTag = async (tagData: ModelsCreateTagRequest) => {
    return dispatch(addTagAction(tagData)).unwrap();
  };

  const updateTag = async (id: number, data: ModelsUpdateTagRequest) => {
    return dispatch(editTagAction({ id, data })).unwrap();
  };

  const deleteTag = async (tagId: number) => {
    return dispatch(removeTagAction(tagId)).unwrap();
  };

  const fetchEntities = async (tagId: number) => {
    return dispatch(fetchTagEntitiesAction(tagId)).unwrap();
  };

  const fetchItems = async (tagId: number) => {
    return dispatch(fetchTagItemsAction(tagId)).unwrap();
  };

  const fetchItemOptions = async (tagId: number) => {
    return dispatch(fetchTagItemOptionsAction(tagId)).unwrap();
  };

  const fetchServices = async (tagId: number) => {
    return dispatch(fetchTagServicesAction(tagId)).unwrap();
  };

  const fetchByItem = async (itemId: number) => {
    return dispatch(fetchTagsByItemAction(itemId)).unwrap();
  };

  const fetchByItemOption = async (itemOptionId: number) => {
    return dispatch(fetchTagsByItemOptionAction(itemOptionId)).unwrap();
  };

  const fetchByService = async (serviceId: number) => {
    return dispatch(fetchTagsByServiceAction(serviceId)).unwrap();
  };

  const linkItem = async (tagId: number, itemId: number) => {
    return dispatch(linkItemToTagAction({ tagId, itemId })).unwrap();
  };

  const unlinkItem = async (tagId: number, itemId: number) => {
    return dispatch(unlinkItemFromTagAction({ tagId, itemId })).unwrap();
  };

  const linkItemOption = async (tagId: number, itemOptionId: number) => {
    return dispatch(linkItemOptionToTagAction({ tagId, itemOptionId })).unwrap();
  };

  const unlinkItemOption = async (tagId: number, itemOptionId: number) => {
    return dispatch(
      unlinkItemOptionFromTagAction({ tagId, itemOptionId })
    ).unwrap();
  };

  const linkService = async (tagId: number, serviceId: number) => {
    return dispatch(linkServiceToTagAction({ tagId, serviceId })).unwrap();
  };

  const unlinkService = async (tagId: number, serviceId: number) => {
    return dispatch(unlinkServiceFromTagAction({ tagId, serviceId })).unwrap();
  };

  const selectBusiness = (businessId: number) => {
    dispatch(setTagsBusinessId(businessId));
  };

  const getTagByIdFromList = (tagId: number) => {
    return getTagByIdSelector(tags, tagId);
  };

  return {
    tags,
    selectedTag,
    selectedBusinessId,

    tagEntities,
    tagItems,
    tagItemOptions,
    tagServices,

    tagsByItem,
    tagsByItemOption,
    tagsByService,

    loading,
    linkLoading,
    error,
    linkError,

    fetchTags,
    fetchTagById,
    createTag,
    updateTag,
    deleteTag,

    fetchEntities,
    fetchItems,
    fetchItemOptions,
    fetchServices,

    fetchByItem,
    fetchByItemOption,
    fetchByService,

    linkItem,
    unlinkItem,
    linkItemOption,
    unlinkItemOption,
    linkService,
    unlinkService,

    selectBusiness,
    getTagById: getTagByIdFromList,
  };
};


