class CreatedByMixin:
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
