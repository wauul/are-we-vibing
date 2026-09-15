package com.wauul.arewevibing;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.PluginHandle;
import android.os.Bundle;
import android.content.Intent;
import ee.forgr.capacitor.social.login.GoogleProvider;
import ee.forgr.capacitor.social.login.SocialLoginPlugin;
import ee.forgr.capacitor.social.login.ModifiedMainActivityForSocialLoginPlugin;

public class MainActivity extends BridgeActivity implements ModifiedMainActivityForSocialLoginPlugin {
    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(VibeCardPlugin.class);
    }
    @Override public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode >= GoogleProvider.REQUEST_AUTHORIZE_GOOGLE_MIN && requestCode < GoogleProvider.REQUEST_AUTHORIZE_GOOGLE_MAX) {
            PluginHandle handle = getBridge().getPlugin("SocialLogin");
            if (handle != null && handle.getInstance() instanceof SocialLoginPlugin) {
                ((SocialLoginPlugin) handle.getInstance()).handleGoogleLoginIntent(requestCode, data);
            }
        }
    }
    @Override public void IHaveModifiedTheMainActivityForTheUseWithSocialLoginPlugin() {}
}
