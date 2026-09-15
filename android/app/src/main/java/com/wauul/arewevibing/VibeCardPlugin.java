package com.wauul.arewevibing;

import android.Manifest;
import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.io.OutputStream;

@CapacitorPlugin(name = "VibeCard", permissions = {
    @Permission(alias = "legacyStorage", strings = { Manifest.permission.WRITE_EXTERNAL_STORAGE })
})
public class VibeCardPlugin extends Plugin {
    @PluginMethod public void saveImage(PluginCall call) {
        if (Build.VERSION.SDK_INT < 29 && getPermissionState("legacyStorage") != PermissionState.GRANTED) {
            requestPermissionForAlias("legacyStorage", call, "storagePermissionResult");
            return;
        }
        save(call);
    }
    @PermissionCallback private void storagePermissionResult(PluginCall call) {
        if (getPermissionState("legacyStorage") == PermissionState.GRANTED) save(call);
        else call.reject("Photo saving permission was declined.");
    }
    private void save(PluginCall call) {
        Uri uri = null;
        try {
            String data = call.getString("data", "");
            if (data.length() > 20000000) throw new IllegalArgumentException("Image too large");
            byte[] bytes = Base64.decode(data, Base64.DEFAULT);
            if (bytes.length < 8 || bytes[0] != (byte) 0x89 || bytes[1] != 0x50 || bytes[2] != 0x4e || bytes[3] != 0x47)
                throw new IllegalArgumentException("Expected a PNG image");
            String filename = call.getString("fileName", "r-we-vibing.png").replaceAll("[^a-zA-Z0-9._-]", "_");
            ContentValues values = new ContentValues();
            values.put(MediaStore.Images.Media.DISPLAY_NAME, filename);
            values.put(MediaStore.Images.Media.MIME_TYPE, "image/png");
            if (Build.VERSION.SDK_INT >= 29) {
                // MediaStore publishes an app-created image without reading the user's photo library.
                values.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/Are We Vibing");
                values.put(MediaStore.Images.Media.IS_PENDING, 1);
            }
            uri = getContext().getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
            if (uri == null) throw new IllegalStateException("Could not create image");
            try (OutputStream stream = getContext().getContentResolver().openOutputStream(uri)) {
                if (stream == null) throw new IllegalStateException("Could not open image");
                stream.write(bytes);
            }
            if (Build.VERSION.SDK_INT >= 29) {
                ContentValues ready = new ContentValues(); ready.put(MediaStore.Images.Media.IS_PENDING, 0);
                getContext().getContentResolver().update(uri, ready, null, null);
            }
            JSObject result = new JSObject(); result.put("uri", uri.toString()); call.resolve(result);
        } catch (Exception error) {
            if (uri != null) getContext().getContentResolver().delete(uri, null, null);
            call.reject("Could not save the image to Gallery.");
        }
    }
}
