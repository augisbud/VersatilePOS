import {
  ModelsAccountRoleLinkDto,
  ConstantsAction,
  ConstantsAccessLevel,
} from '@/api/types.gen';

export const getUserPermissions = (
  roles?: ModelsAccountRoleLinkDto[]
): Map<ConstantsAction, Set<ConstantsAccessLevel>> => {
  const permissions = new Map<ConstantsAction, Set<ConstantsAccessLevel>>();

  if (!roles || roles.length === 0) {
    return permissions;
  }

  roles.forEach((roleLink) => {
    if (roleLink.status !== 'Active') {
      return;
    }

    const role = roleLink.role;
    if (!role || !role.functionLinks) {
      return;
    }

    role.functionLinks.forEach((functionLink) => {
      const action = functionLink.function?.action;
      if (!action) {
        return;
      }

      if (!permissions.has(action)) {
        permissions.set(action, new Set<ConstantsAccessLevel>());
      }

      const accessLevels = permissions.get(action)!;

      if (functionLink.accessLevels) {
        functionLink.accessLevels.forEach((level) => {
          accessLevels.add(level);
        });
      }
    });
  });

  return permissions;
};

export const hasPermission = (
  roles: ModelsAccountRoleLinkDto[] | undefined,
  action: ConstantsAction,
  accessLevel: ConstantsAccessLevel
) => {
  const permissions = getUserPermissions(roles);
  const actionPermissions = permissions.get(action);

  if (!actionPermissions) {
    return false;
  }

  return actionPermissions.has(accessLevel);
};

export const canRead = (
  roles: ModelsAccountRoleLinkDto[] | undefined,
  action: ConstantsAction
) => {
  return (
    hasPermission(roles, action, 'Read') ||
    hasPermission(roles, action, 'Write')
  );
};

export const canWrite = (
  roles: ModelsAccountRoleLinkDto[] | undefined,
  action: ConstantsAction
) => {
  return hasPermission(roles, action, 'Write');
};

export const canReadAccounts = (roles?: ModelsAccountRoleLinkDto[]) =>
  canRead(roles, 'accounts');

export const canWriteAccounts = (roles?: ModelsAccountRoleLinkDto[]) =>
  canWrite(roles, 'accounts');

export const canReadBusinesses = (roles?: ModelsAccountRoleLinkDto[]) =>
  canRead(roles, 'businesses');

export const canWriteBusinesses = (roles?: ModelsAccountRoleLinkDto[]) =>
  canWrite(roles, 'businesses');

export const canReadRoles = (roles?: ModelsAccountRoleLinkDto[]) =>
  canRead(roles, 'roles');

export const canWriteRoles = (roles?: ModelsAccountRoleLinkDto[]) =>
  canWrite(roles, 'roles');

export const canReadServices = (roles?: ModelsAccountRoleLinkDto[]) =>
  canRead(roles, 'services');

export const canWriteServices = (roles?: ModelsAccountRoleLinkDto[]) =>
  canWrite(roles, 'services');

export const canReadReservations = (roles?: ModelsAccountRoleLinkDto[]) =>
  canRead(roles, 'reservations');

export const canWriteReservations = (roles?: ModelsAccountRoleLinkDto[]) =>
  canWrite(roles, 'reservations');

export const canReadPriceModifiers = (roles?: ModelsAccountRoleLinkDto[]) =>
  canRead(roles, 'priceModifiers');

export const canWritePriceModifiers = (roles?: ModelsAccountRoleLinkDto[]) =>
  canWrite(roles, 'priceModifiers');

export const canReadItems = (roles?: ModelsAccountRoleLinkDto[]) =>
  canRead(roles, 'items');

export const canWriteItems = (roles?: ModelsAccountRoleLinkDto[]) =>
  canWrite(roles, 'items');

export const canReadItemOptions = (roles?: ModelsAccountRoleLinkDto[]) =>
  canRead(roles, 'itemOptions');

export const canWriteItemOptions = (roles?: ModelsAccountRoleLinkDto[]) =>
  canWrite(roles, 'itemOptions');

export const canReadOrders = (roles?: ModelsAccountRoleLinkDto[]) =>
  canRead(roles, 'orders');

export const canWriteOrders = (roles?: ModelsAccountRoleLinkDto[]) =>
  canWrite(roles, 'orders');

export const canReadTags = (roles?: ModelsAccountRoleLinkDto[]) =>
  canRead(roles, 'tags');

export const canWriteTags = (roles?: ModelsAccountRoleLinkDto[]) =>
  canWrite(roles, 'tags');
