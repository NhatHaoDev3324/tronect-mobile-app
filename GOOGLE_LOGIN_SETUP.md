# Google Login Setup Guide

## Các bước cài đặt Google Login

### 1. Tạo Google OAuth Credentials

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo một project mới (nếu chưa có)
3. Bật **Google+ API**:
   - Vào **APIs & Services** > **Library**
   - Tìm "Google+ API" và bật nó

4. Tạo OAuth 2.0 credentials:
   - Vào **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth Client ID**
   - Chọn **Application type** > **Web application** (cho web) hoặc **Android** (cho Android)

### 2. Cấu hình cho Android

1. Lấy SHA-1 fingerprint từ dự án:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```

2. Tạo OAuth Client ID cho Android:
   - Application type: Android
   - Paste SHA-1 fingerprint
   - Paste package name: `com.tronect` (hoặc tên package của bạn)
   - Lấy **Android Client ID**

### 3. Cấu hình cho Web

- Tạo OAuth Client ID cho Web
- Lấy **Web Client ID**

### 4. Cấu hình cho iOS

1. Tạo OAuth Client ID cho iOS:
   - Package name: Bundle ID của app (e.g., `com.tronect.ios`)
   - Lấy **iOS Client ID**

### 5. Cập nhật `.env.local` file

Tạo file `.env.local` trong root project:

```env
EXPO_PUBLIC_ANDROID_CLIENT_ID=YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

### 6. Cấu hình iOS trong `app.json`

Thêm vào file `app.json` trong `plugins`:

```json
{
  "plugins": [
    [
      "expo-auth-session/google",
      {
        "iosClientId": "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com"
      }
    ]
  ]
}
```

## Backend API

Backend cần implement endpoint:
- **POST** `/api/tenant/login/google`
- Request body:
  ```json
  {
    "token": "google_access_token"
  }
  ```
- Response:
  ```json
  {
    "status": true,
    "accessToken": "your_jwt_token",
    "data": {
      "id": "user_id",
      "username": "username",
      "email": "email@example.com",
      "picture": "profile_picture_url",
      "phone": "phone_number",
      "provider": "google",
      "role": "user",
      "created_at": "2025-01-09T..."
    }
  }
  ```

## Chú ý

- Client ID sẽ khác nhau cho Android, Web, và iOS
- Ensure backend xác thực Google token và trả về access token hợp lệ
- Provider field nên được set thành "google" khi login bằng Google
