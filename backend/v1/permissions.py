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
        return request.user.role in ['admin', 'company']

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
            
        # 1. Verifica se a empresa é a dona direta
        if hasattr(obj, 'company') and obj.company == request.user.company:
            return True
            
        # 2. Verifica se a empresa é a dona do projeto (Owner)
        if hasattr(obj, 'project') and obj.project and obj.project.company == request.user.company:
            return True
            
        # 3. Libera apenas LEITURA (SAFE_METHODS) para empresas listadas/participantes
        if hasattr(obj, 'participating_companies') and request.method in permissions.SAFE_METHODS:
            if obj.participating_companies.filter(company=request.user.company).exists():
                return True

        return obj == request.user.company