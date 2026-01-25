from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsControlOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'control']

class IsCompanyOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        # Company só mexe no que é seu
        return request.user.role in ['admin', 'company']

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        # Verifica propriedade (assumindo que obj tem company ou é company)
        if hasattr(obj, 'company'):
            return obj.company == request.user.company
        if hasattr(obj, 'project'): # Event -> Project -> Company
            return obj.project.company == request.user.company
        return obj == request.user.company