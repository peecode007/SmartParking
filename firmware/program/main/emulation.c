#include <cJSON.h>
#include <esp_eth.h>
#include <esp_event.h>
#include <esp_http_client.h>
#include <esp_http_server.h>
#include <esp_log.h>
#include <esp_netif.h>
#include <esp_system.h>
#include <esp_tls.h>
#include <freertos/FreeRTOS.h>
#include <freertos/task.h>
#include <nvs_flash.h>
#include <string.h>
#include <sys/param.h>

// * * * * * *

#if 1
    #define API_SERVER_NAME "http://frontend"
#else
    #define API_SERVER_NAME "http://127.0.0.1"
#endif
#define API_SERVER_PATH        "/api/platerecog"
#define API_SERVER_PORT        3000
#define API_KEY                "camera-key-001"
#define WEBSERVER_PORT         80
#define MAX_HTTP_RECV_BUFFER   512
#define MAX_HTTP_OUTPUT_BUFFER 2048

static const char    *TAG    = "BARRIER_CONTROL";
static httpd_handle_t server = NULL;

// * * * * * *

const char *html_dashboard =
    "<!DOCTYPE html>\n"
    "<html>\n"
    "<head>\n"
    "    <title>ESP32 Parking Barrier Control</title>\n"
    "    <style>\n"
    "        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; text-align: center; "
    "}\n"
    "        h1 { color: #333; }\n"
    "        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; "
    "border-radius: 5px; }\n"
    "        .form-group { margin-bottom: 15px; }\n"
    "        .btn { background-color: #4CAF50; color: white; padding: 10px 15px; border: none; "
    "border-radius: 4px; cursor: pointer; }\n"
    "        .btn:hover { background-color: #45a049; }\n"
    "        #result { margin-top: 20px; padding: 10px; border-radius: 5px; display: none; }\n"
    "        .success { background-color: #dff0d8; color: #3c763d; }\n"
    "        .error { background-color: #f2dede; color: #a94442; }\n"
    "        #preview { max-width: 100%; max-height: 300px; margin-top: 10px; display: none; }\n"
    "    </style>\n"
    "</head>\n"
    "<body>\n"
    "    <div class=\"container\">\n"
    "        <h1>Parking Barrier Control</h1>\n"
    "        <form id=\"uploadForm\" enctype=\"multipart/form-data\">\n"
    "            <div class=\"form-group\">\n"
    "                <label for=\"imageFile\">Select Vehicle Image:</label><br>\n"
    "                <input type=\"file\" id=\"imageFile\" name=\"imageFile\" accept=\"image/*\" "
    "onchange=\"previewImage(this)\">\n"
    "            </div>\n"
    "            <img id=\"preview\" src=\"#\" alt=\"Image Preview\" />\n"
    "            <div class=\"form-group\">\n"
    "                <button type=\"button\" class=\"btn\" onclick=\"uploadImage()\">Process "
    "Image</button>\n"
    "            </div>\n"
    "        </form>\n"
    "        <div id=\"result\"></div>\n"
    "    </div>\n"
    "    <script>\n"
    "        function previewImage(input) {\n"
    "            var preview = document.getElementById('preview');\n"
    "            if (input.files && input.files[0]) {\n"
    "                var reader = new FileReader();\n"
    "                reader.onload = function(e) {\n"
    "                    preview.src = e.target.result;\n"
    "                    preview.style.display = 'block';\n"
    "                }\n"
    "                reader.readAsDataURL(input.files[0]);\n"
    "            }\n"
    "        }\n"
    "        \n"
    "        function uploadImage() {\n"
    "            var fileInput = document.getElementById('imageFile');\n"
    "            var resultDiv = document.getElementById('result');\n"
    "            \n"
    "            if (!fileInput.files[0]) {\n"
    "                resultDiv.innerHTML = 'Please select an image first.';\n"
    "                resultDiv.className = 'error';\n"
    "                resultDiv.style.display = 'block';\n"
    "                return;\n"
    "            }\n"
    "            \n"
    "            var formData = new FormData();\n"
    "            formData.append('image', fileInput.files[0]);\n"
    "            \n"
    "            resultDiv.innerHTML = 'Processing image, please wait...';\n"
    "            resultDiv.className = '';\n"
    "            resultDiv.style.display = 'block';\n"
    "            \n"
    "            fetch('/upload', {\n"
    "                method: 'POST',\n"
    "                body: formData\n"
    "            })\n"
    "            .then(response => response.json())\n"
    "            .then(data => {\n"
    "                if (data.success) {\n"
    "                    resultDiv.innerHTML = 'Number Plate: ' + data.plate_number + '<br>Status: "
    "' + data.message;\n"
    "                    resultDiv.className = 'success';\n"
    "                } else {\n"
    "                    resultDiv.innerHTML = 'Error: ' + data.message;\n"
    "                    resultDiv.className = 'error';\n"
    "                }\n"
    "            })\n"
    "            .catch(error => {\n"
    "                resultDiv.innerHTML = 'Error: ' + error.message;\n"
    "                resultDiv.className = 'error';\n"
    "            });\n"
    "        }\n"
    "    </script>\n"
    "</body>\n"
    "</html>";

// * * * * * *

static void
     eth_event_handler(void *arg, esp_event_base_t event_base, int32_t event_id, void *event_data);
void register_ethernet(void);

static httpd_handle_t start_webserver(void);

static esp_err_t      root_get_handler(httpd_req_t *req);
static esp_err_t      upload_post_handler(httpd_req_t *req);

static esp_err_t      send_image_to_api(const uint8_t *image_data,
                                        size_t         image_len,
                                        char         **plate_number,
                                        char         **response_message,
                                        bool          *access_granted);
esp_err_t             _http_event_handler(esp_http_client_event_t *evt);

// * * * * * *

void app_main() {
    ESP_LOGI(TAG, "Starting Barrier Control (QEMU)");

    register_ethernet();

    server = start_webserver();
    if (server) {
        ESP_LOGD(TAG, "Web interface running at http://localhost:%d", WEBSERVER_PORT);
    } else {
        ESP_LOGE(TAG, "Failed to start HTTP server");
    }
}

// * * * * * *

static const httpd_uri_t root_get = {.uri = "/", .method = HTTP_GET, .handler = root_get_handler};

static const httpd_uri_t upload_post = {.uri     = "/upload",
                                        .method  = HTTP_POST,
                                        .handler = upload_post_handler};

// * * * * * *

static httpd_handle_t start_webserver(void) {
    httpd_handle_t server   = NULL;
    httpd_config_t config   = HTTPD_DEFAULT_CONFIG();
    config.server_port      = WEBSERVER_PORT;
    config.lru_purge_enable = true;

    ESP_LOGI(TAG, "Starting server on port: '%d'", config.server_port);


    if (httpd_start(&server, &config) == ESP_OK) {
        ESP_LOGD(TAG, "Registering URI handlers");

        httpd_register_uri_handler(server, &root_get);
        httpd_register_uri_handler(server, &upload_post);

        return server;
    }

    return NULL;
}

// * * * * * *

static esp_err_t root_get_handler(httpd_req_t *req) {
    httpd_resp_set_type(req, "text/html");
    httpd_resp_send(req, html_dashboard, strlen(html_dashboard));
    return ESP_OK;
}

static esp_err_t upload_post_handler(httpd_req_t *req) {
    ESP_LOGD(TAG, "Upload received, length: %d bytes", req->content_len);
    if (req->content_len <= 0 || req->content_len > 1024 * 1024) {
        httpd_resp_send_err(req, HTTPD_400_BAD_REQUEST, "Invalid image");
        return ESP_FAIL;
    }

    uint8_t *image_data = malloc(req->content_len);
    if (!image_data) {
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "No memory");
        return ESP_FAIL;
    }

    int received = 0;
    while (received < req->content_len) {
        int ret = httpd_req_recv(req, (char *)image_data + received, req->content_len - received);
        if (ret <= 0) {
            if (image_data)
                free(image_data), (image_data = NULL);
            httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Receive error");
            return ESP_FAIL;
        }
        received += ret;
    }

    char *plate_number   = NULL;
    char *res_message    = NULL;
    bool  access_granted = false;
    send_image_to_api(image_data, received, &plate_number, &res_message, &access_granted);
    if (image_data)
        free(image_data), (image_data = NULL);

    cJSON *resp = cJSON_CreateObject();
    cJSON_AddBoolToObject(resp, "success", access_granted);
    cJSON_AddStringToObject(resp, "plate_number", strdup(plate_number));
    cJSON_AddStringToObject(resp,
                            "message",
                            res_message ? strdup(res_message) : strdup("No message"));

    if (res_message)
        free(res_message), (res_message = NULL);
    if (plate_number)
        free(plate_number), (plate_number = NULL);

    char *resp_str = cJSON_Print(resp);
    httpd_resp_set_type(req, "application/json");
    httpd_resp_send(req, resp_str, strlen(resp_str));

    cJSON_Delete(resp);
    if (resp_str)
        free(resp_str), (resp_str = NULL);
    return ESP_OK;
}

// * * * * * *

typedef struct {
        char  *data;
        size_t size;
} http_response_data_t;

esp_err_t _http_event_handler(esp_http_client_event_t *evt) {
    http_response_data_t *response_data = (http_response_data_t *)evt->user_data;
    switch (evt->event_id) {
        case HTTP_EVENT_ERROR: {
            ESP_LOGD(TAG, "HTTP_EVENT_ERROR");
            break;
        }
        case HTTP_EVENT_ON_CONNECTED: {
            ESP_LOGD(TAG, "HTTP_EVENT_ON_CONNECTED");
            break;
        }
        case HTTP_EVENT_HEADER_SENT: {
            ESP_LOGD(TAG, "HTTP_EVENT_HEADER_SENT");
            break;
        }
        case HTTP_EVENT_ON_HEADER: {
            ESP_LOGD(TAG,
                     "HTTP_EVENT_ON_HEADER, key=%s, value=%s",
                     evt->header_key,
                     evt->header_value);
            break;
        }
        case HTTP_EVENT_ON_DATA: {
            ESP_LOGD(TAG, "HTTP_EVENT_ON_DATA, len=%d", evt->data_len);
            if (response_data->data == NULL) {
                response_data->data = malloc(MAX_HTTP_RECV_BUFFER);
                if (response_data->data == NULL) {
                    ESP_LOGE(TAG, "Failed to allocate memory for response buffer");
                    return ESP_FAIL;
                }
                response_data->size = 0;
            }

            if (response_data->size + evt->data_len < MAX_HTTP_RECV_BUFFER) {
                memcpy(response_data->data + response_data->size, evt->data, evt->data_len);
                response_data->size                     += evt->data_len;
                response_data->data[response_data->size] = 0;
            } else {
                ESP_LOGE(TAG, "Response buffer too small");
            }
            break;

            if (!esp_http_client_is_chunked_response(evt->client)) {
                int copy_len = 0;
                if (response_data->data) {
                    copy_len = MIN(evt->data_len, (MAX_HTTP_OUTPUT_BUFFER - response_data->size));
                    if (copy_len) {
                        memcpy(response_data->data + response_data->size, evt->data, copy_len);
                    }
                }
                response_data->size += copy_len;
            }

            break;
        }
        case HTTP_EVENT_ON_FINISH: {
            ESP_LOGD(TAG, "HTTP_EVENT_ON_FINISH");
            break;
        }
        case HTTP_EVENT_DISCONNECTED: {
            ESP_LOGD(TAG, "HTTP_EVENT_DISCONNECTED");
            int       mbedtls_err = 0;
            esp_err_t err = esp_tls_get_and_clear_last_error((esp_tls_error_handle_t)evt->data,
                                                             &mbedtls_err,
                                                             NULL);
            if (err != 0) {
                ESP_LOGI(TAG, "Last esp error code: 0x%x", err);
                ESP_LOGI(TAG, "Last mbedtls failure: 0x%x", mbedtls_err);
            }
            break;
        }
        case HTTP_EVENT_REDIRECT: {
            ESP_LOGD(TAG, "HTTP_EVENT_REDIRECT");
            esp_http_client_set_header(evt->client, "From", "user@example.com");
            esp_http_client_set_header(evt->client, "Accept", "text/html");
            esp_http_client_set_redirection(evt->client);
            break;
        }
    }
    return ESP_OK;
}

static esp_err_t send_image_to_api(const uint8_t *image_data,
                                   size_t         image_len,
                                   char         **plate_number,
                                   char         **response_message,
                                   bool          *access_granted) {
    char  url[256];
    char *plate_num = NULL;

    snprintf(url, sizeof(url), "%s:%d%s", API_SERVER_NAME, API_SERVER_PORT, API_SERVER_PATH);

    ESP_LOGD(TAG, "Sending image to API server: %s", url);

    http_response_data_t     response_data = {.data = NULL, .size = 0};

    esp_http_client_config_t config        = {
               .url                   = url,
               .event_handler         = _http_event_handler,
               .user_data             = &response_data,
               .method                = HTTP_METHOD_POST,
               .timeout_ms            = 10000, // 10s
               .disable_auto_redirect = false,
               .max_redirection_count = 5,
               .cert_pem              = NULL,
    };

    esp_http_client_handle_t client = esp_http_client_init(&config);
    if (!client) {
        ESP_LOGE(TAG, "Failed to initialize HTTP client");
        return ESP_FAIL;
    }

    char        boundary[64]    = "WebKitFormBoundary";
    const char *boundary_marker = "----WebKitFormBoundary";
    char       *boundary_pos    = strstr((char *)image_data, boundary_marker);
    if (boundary_pos) {
        char *end_of_boundary = strstr(boundary_pos, "\r\n");
        if (end_of_boundary) {
            int boundary_len = end_of_boundary - boundary_pos;
            if (boundary_len < sizeof(boundary)) {
                memcpy(boundary, boundary_pos + 4, boundary_len - 4);
                boundary[boundary_len - 4] = '\0';
                ESP_LOGD(TAG, "Extracted boundary: %s", boundary);
            }
        }
    }
    char content_type[100];
    snprintf(content_type, sizeof(content_type), "multipart/form-data; boundary=----%s", boundary);

    esp_http_client_set_header(client, "Content-Type", content_type);
    esp_http_client_set_header(client, "Connection", "keep-alive");
    esp_http_client_set_header(client, "X-API-KEY", API_KEY);
    esp_http_client_set_post_field(client, (char *)image_data, image_len);

    esp_err_t err = esp_http_client_perform(client);

    if (err == ESP_OK) {
        int status_code = esp_http_client_get_status_code(client);
        ESP_LOGD(TAG, "HTTP POST Status = %d", status_code);

        if (status_code == 200) {
            if (response_data.data && response_data.size > 0) {
                cJSON *root = cJSON_Parse(response_data.data);
                if (root) {
                    cJSON *json_success = cJSON_GetObjectItem(root, "success");
                    cJSON *json_plate   = cJSON_GetObjectItem(root, "plate_number");
                    cJSON *json_message = cJSON_GetObjectItem(root, "message");

                    if (cJSON_IsString(json_plate))
                        plate_num = strdup(json_plate->valuestring);
                    if (cJSON_IsString(json_message))
                        *response_message = strdup(json_message->valuestring);

                    *access_granted = (json_success && cJSON_IsTrue(json_success));

                    ESP_LOGI(TAG,
                             "Plate: %s, Access: %s, Message: %s",
                             plate_num ? plate_num : "Unknown",
                             *access_granted ? "Granted" : "Denied",
                             *response_message ? *response_message : "No message");

                    cJSON_Delete(root);
                }
                if (response_data.data)
                    free(response_data.data), (response_data.data = NULL);
            }
        }
    } else {
        ESP_LOGE(TAG, "HTTP POST request failed: %s", esp_err_to_name(err));
    }

    esp_http_client_cleanup(client);
    *plate_number = plate_num ? plate_num : strdup("Unknown");
    return ESP_OK;
}

// * * * * * *

static esp_eth_handle_t eth_handle = NULL;
static esp_netif_t     *eth_netif  = NULL;

static void
    eth_event_handler(void *arg, esp_event_base_t event_base, int32_t event_id, void *event_data) {
    if (event_base == ETH_EVENT) {
        if (event_id == ETHERNET_EVENT_START)
            return;
        if (event_id == ETHERNET_EVENT_STOP)
            return;
    }
    if (event_base == IP_EVENT)
        if (event_id == IP_EVENT_ETH_GOT_IP)
            return;
}

void register_ethernet(void) {
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    esp_netif_config_t cfg      = ESP_NETIF_DEFAULT_ETH();
    eth_netif                   = esp_netif_new(&cfg);

    eth_mac_config_t mac_config = ETH_MAC_DEFAULT_CONFIG();
    eth_phy_config_t phy_config = ETH_PHY_DEFAULT_CONFIG();
    esp_eth_mac_t   *mac        = esp_eth_mac_new_openeth(&mac_config);

    esp_eth_phy_t   *phy        = esp_eth_phy_new_dp83848(&phy_config);

    esp_eth_config_t config     = ETH_DEFAULT_CONFIG(mac, phy);
    ESP_ERROR_CHECK(esp_eth_driver_install(&config, &eth_handle));
    ESP_ERROR_CHECK(esp_netif_attach(eth_netif, esp_eth_new_netif_glue(eth_handle)));
    ESP_ERROR_CHECK(
        esp_event_handler_register(ETH_EVENT, ESP_EVENT_ANY_ID, &eth_event_handler, NULL));
    ESP_ERROR_CHECK(
        esp_event_handler_register(IP_EVENT, IP_EVENT_ETH_GOT_IP, &eth_event_handler, NULL));
    ESP_ERROR_CHECK(esp_eth_start(eth_handle));

    ESP_LOGD(TAG, "Connected to ethernet!");
}

// * * * * * *
