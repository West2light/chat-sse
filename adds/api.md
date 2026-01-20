## GET 
# https://dify-api.dtp-dev.site/console/api/system-features
Responsive:
{
    "sso_enforced_for_signin": false,
    "sso_enforced_for_signin_protocol": "",
    "enable_marketplace": true,
    "max_plugin_package_size": 52428800,
    "enable_email_code_login": false,
    "enable_email_password_login": true,
    "enable_social_oauth_login": false,
    "is_allow_register": false,
    "is_allow_create_workspace": false,
    "is_email_setup": true,
    "license": {
        "status": "none",
        "expired_at": "",
        "workspaces": {
            "enabled": false,
            "size": 0,
            "limit": 0
        }
    },
    "branding": {
        "enabled": false,
        "application_title": "",
        "login_page_logo": "",
        "workspace_logo": "",
        "favicon": ""
    },
    "webapp_auth": {
        "enabled": false,
        "allow_sso": false,
        "sso_config": {
            "protocol": ""
        },
        "allow_email_code_login": false,
        "allow_email_password_login": false
    },
    "plugin_installation_permission": {
        "plugin_installation_scope": "all",
        "restrict_to_marketplace_only": false
    },
    "enable_change_email": true,
    "plugin_manager": {
        "enabled": false
    }
}
# https://ai-api.dtp-dev.site/api/login/status?app_code=PnT9wO59EmKcGdE9
responsive:
{
    "logged_in": true,
    "app_logged_in": true
}
# https://ai-api.dtp-dev.site/api/webapp/access-mode?appCode=PnT9wO59EmKcGdE9
responsive:
{
    "accessMode": "public"
}
# https://ai-api.dtp-dev.site/api/site
{
    "app_id": "325c60ae-f883-4f36-afe7-d553d4c5f56e",
    "end_user_id": "4c73075e-2c21-434c-b3a1-8b271f879497",
    "enable_site": true,
    "site": {
        "title": "DTPOS AI",
        "chat_color_theme": "#781a1a",
        "chat_color_theme_inverted": false,
        "icon_type": "image",
        "icon": "eb61b7fd-0bd0-48d7-b1dd-245171249a4f",
        "icon_background": "#FFEAD5",
        "icon_url": "https://dify-api.dtp-dev.site//files/eb61b7fd-0bd0-48d7-b1dd-245171249a4f/file-preview?timestamp=1768211335&nonce=f457890b08227fc5824c4c9ddb0dd541&sign=dChR5XkCCbsxk7wjwpX3d3CljxUB68zz0TqkcLimRFU%3D",
        "description": "DTPOS AI hỗ trợ sử dụng hệ thống phần mềm quản lí bán hàng DTPOS",
        "copyright": "",
        "privacy_policy": null,
        "custom_disclaimer": "\n",
        "default_language": "en-US",
        "prompt_public": false,
        "show_workflow_steps": false,
        "use_icon_as_answer_icon": true
    },
    "model_config": null,
    "plan": "basic",
    "can_replace_logo": false,
    "custom_config": null
}
# https://ai-api.dtp-dev.site/api/conversations?limit=100&pinned=true
Responsive:
{
    "limit": 100,
    "has_more": false,
    "data": []
}
# https://ai-api.dtp-dev.site/api/parameters
Responsive:
{
    "opening_statement": "",
    "suggested_questions": [],
    "suggested_questions_after_answer": {
        "enabled": false
    },
    "speech_to_text": {
        "enabled": false
    },
    "text_to_speech": {
        "enabled": false,
        "voice": "",
        "language": ""
    },
    "retriever_resource": {
        "enabled": false
    },
    "annotation_reply": {
        "enabled": false
    },
    "more_like_this": {
        "enabled": false
    },
    "user_input_form": [],
    "sensitive_word_avoidance": {
        "enabled": false
    },
    "file_upload": {
        "image": {
            "enabled": false,
            "number_limits": 3,
            "transfer_methods": [
                "local_file",
                "remote_url"
            ]
        },
        "enabled": false,
        "allowed_file_types": [
            "image"
        ],
        "allowed_file_extensions": [
            ".JPG",
            ".JPEG",
            ".PNG",
            ".GIF",
            ".WEBP",
            ".SVG"
        ],
        "allowed_file_upload_methods": [
            "local_file",
            "remote_url"
        ],
        "number_limits": 3,
        "fileUploadConfig": {
            "file_size_limit": 15,
            "batch_count_limit": 5,
            "image_file_size_limit": 10,
            "video_file_size_limit": 100,
            "audio_file_size_limit": 50,
            "workflow_file_upload_limit": 10,
            "image_file_batch_limit": 10,
            "single_chunk_attachment_limit": 10
        }
    },
    "system_parameters": {
        "image_file_size_limit": 10,
        "video_file_size_limit": 100,
        "audio_file_size_limit": 50,
        "file_size_limit": 15,
        "workflow_file_upload_limit": 10
    }
}
# https://ai-api.dtp-dev.site/api/meta
responsive:
{
    "tool_icons": {}
}
# https://ai-api.dtp-dev.site/api/messages?conversation_id=58242be7-2b40-4e49-a953-7115f6626190&limit=20&last_id=
responsive:
{
    "limit": 20,
    "has_more": false,
    "data": [
        {
            "id": "6038bcae-fcea-41a8-b721-ed44da9354a5",
            "conversation_id": "58242be7-2b40-4e49-a953-7115f6626190",
            "parent_message_id": null,
            "inputs": {},
            "query": "tét",
            "answer": "Xin lỗi, hiện tại tài liệu của tôi chưa cập nhật thông tin về vấn đề này. Vui lòng liên hệ bộ phận hỗ trợ kỹ thuật của DTPOS để được giải đáp.",
            "message_files": [],
            "feedback": null,
            "retriever_resources": [],
            "created_at": 1768209938,
            "agent_thoughts": [],
            "metadata": {
                "annotation_reply": null,
                "retriever_resources": [],
                "usage": {
                    "prompt_tokens": 6734,
                    "prompt_unit_price": "0.15",
                    "prompt_price_unit": "0.000001",
                    "prompt_price": "0.0010102",
                    "completion_tokens": 74,
                    "completion_unit_price": "0.6",
                    "completion_price_unit": "0.000001",
                    "completion_price": "0.0000444",
                    "total_tokens": 6808,
                    "total_price": "0.0010546",
                    "currency": "USD",
                    "latency": 3.933,
                    "time_to_first_token": 4.895,
                    "time_to_generate": 0.503
                }
            },
            "status": "normal",
            "error": null
        }
    ]
}