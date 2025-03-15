from django.urls import path
from .views import UserListView, UserDetailView, RegisterView, ProfileView, CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("api/users/", UserListView.as_view(), name="user_list"),
    path("api/users/<int:pk>/", UserDetailView.as_view(), name="user_detail"),

    path("api/auth/login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),

    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/profile/", ProfileView.as_view(), name="profile"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
