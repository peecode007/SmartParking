#include <string.h>
#include <cJSON.h>

#include "esp_event.h"
#include "esp_http_client.h"
#include "esp_netif.h"
#include "esp_eth.h"
#include "nvs_flash.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include <esp_event.h>
#include <esp_log.h>
#include <esp_system.h>
#include <sys/param.h>
#include <esp_http_server.h>


#define SERVER_NAME    "http://localhost"
#define SERVER_PATH    "/api/platerecog"
#define SERVER_PORT    3000
#define API_KEY        "camera1"
#define WEBSERVER_PORT 80

static const char    *TAG           = "BARRIER_CONTROL";
static bool           net_connected = false;
static httpd_handle_t server        = NULL;

const char           *html_dashboard =
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

static esp_eth_handle_t eth_handle = NULL;
static esp_netif_t     *eth_netif  = NULL;

static void
    event_handler(void *arg, esp_event_base_t event_base, int32_t event_id, void *event_data) {
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
    ESP_ERROR_CHECK(esp_event_handler_register(ETH_EVENT, ESP_EVENT_ANY_ID, &event_handler, NULL));
    ESP_ERROR_CHECK(
        esp_event_handler_register(IP_EVENT, IP_EVENT_ETH_GOT_IP, &event_handler, NULL));
    ESP_ERROR_CHECK(esp_eth_start(eth_handle));

    ESP_LOGI(TAG, "Connected to ethernet");

    net_connected = true;
}

static esp_err_t send_image_to_api(const uint8_t *image_data,
                                   size_t         image_len,
                                   char         **plate_number,
                                   bool          *access_granted) {
    ESP_LOGI(TAG, "Sending image to API server: %s%s", SERVER_NAME, SERVER_PATH);

    char url[256];
    snprintf(url, sizeof(url), "%s:%d%s", SERVER_NAME, SERVER_PORT, SERVER_PATH);

    char                    *plate_num = NULL;
    esp_http_client_config_t config    = {
           .url           = url,
           .event_handler = NULL,
           .method        = HTTP_METHOD_POST,
    };

    esp_http_client_handle_t client = esp_http_client_init(&config);
    if (client != NULL) {
        esp_http_client_set_header(client,
                                   "Content-Type",
                                   "multipart/form-data; boundary=boundary");
        esp_http_client_set_header(client, "X-API-KEY", API_KEY);

        const char *boundary_start =
            "--boundary\r\n"
            "Content-Disposition: form-data; name=\"image\"; filename=\"vehicle.jpg\"\r\n"
            "Content-Type: image/jpeg\r\n\r\n";
        const char *boundary_end = "\r\n--boundary--\r\n";

        size_t      total_len    = strlen(boundary_start) + image_len + strlen(boundary_end);
        uint8_t    *post_data    = malloc(total_len);

        if (post_data) {
            size_t offset = 0;

            memcpy(post_data, boundary_start, strlen(boundary_start));
            offset += strlen(boundary_start);

            memcpy(post_data + offset, image_data, image_len);
            offset += image_len;

            memcpy(post_data + offset, boundary_end, strlen(boundary_end));

            esp_http_client_set_post_field(client, (char *)post_data, total_len);

            esp_err_t err = esp_http_client_perform(client);
            free(post_data);

            if (err == ESP_OK) {
                int status_code = esp_http_client_get_status_code(client);
                ESP_LOGI(TAG, "HTTP POST Status = %d", status_code);

                if (status_code == 200) {
                    int   content_length  = esp_http_client_get_content_length(client);
                    char *response_buffer = malloc(content_length + 1);

                    if (response_buffer) {
                        int read_len =
                            esp_http_client_read_response(client, response_buffer, content_length);
                        if (read_len > 0) {
                            response_buffer[read_len] = 0;
                            ESP_LOGI(TAG, "Response: %s", response_buffer);

                            cJSON *root = cJSON_Parse(response_buffer);
                            if (root) {
                                cJSON *json_success = cJSON_GetObjectItem(root, "success");
                                cJSON *json_plate   = cJSON_GetObjectItem(root, "plate_number");
                                cJSON *json_message = cJSON_GetObjectItem(root, "message");

                                if (cJSON_IsString(json_plate))
                                    plate_num = strdup(json_plate->valuestring);

                                *access_granted = (json_success && cJSON_IsTrue(json_success));

                                ESP_LOGI(TAG,
                                         "Plate: %s, Access: %s, Message: %s",
                                         plate_num ? plate_num : "Unknown",
                                         *access_granted ? "Granted" : "Denied",
                                         json_message && cJSON_IsString(json_message)
                                             ? json_message->valuestring
                                             : "No message");

                                cJSON_Delete(root);
                            }
                        }
                        free(response_buffer);
                    }
                }
            } else {
                ESP_LOGE(TAG, "HTTP POST request failed: %s", esp_err_to_name(err));
            }
        }
    }

    esp_http_client_cleanup(client);
    *plate_number = plate_num ? plate_num : strdup("Unknown");
    ESP_LOGI(TAG, "Access: %s", *access_granted ? "Granted" : "Denied");
    return ESP_OK;
}

static esp_err_t root_handler(httpd_req_t *req) {
    httpd_resp_set_type(req, "text/html");
    httpd_resp_send(req, html_dashboard, strlen(html_dashboard));
    return ESP_OK;
}

static esp_err_t upload_handler(httpd_req_t *req) {
    ESP_LOGI(TAG, "Upload received, length: %d bytes", req->content_len);
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
            free(image_data);
            httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Receive error");
            return ESP_FAIL;
        }
        received += ret;
    }

    char *plate_number   = NULL;
    bool  access_granted = false;
    send_image_to_api(image_data, received, &plate_number, &access_granted);
    free(image_data);

    cJSON *resp = cJSON_CreateObject();
    cJSON_AddBoolToObject(resp, "success", true);
    cJSON_AddStringToObject(resp, "plate_number", plate_number);
    cJSON_AddStringToObject(resp,
                            "message",
                            access_granted ? "Access granted. Barrier opened."
                                           : "Access denied. Payment required.");

    char *resp_str = cJSON_Print(resp);
    httpd_resp_set_type(req, "application/json");
    httpd_resp_send(req, resp_str, strlen(resp_str));

    cJSON_Delete(resp);
    free(resp_str);
    free(plate_number);
    return ESP_OK;
}

static httpd_handle_t start_webserver(void) {
    httpd_config_t config   = HTTPD_DEFAULT_CONFIG();
    config.server_port      = WEBSERVER_PORT;
    config.lru_purge_enable = true;

    httpd_handle_t server   = NULL;
    if (httpd_start(&server, &config) == ESP_OK) {
        httpd_register_uri_handler(
            server,
            &(httpd_uri_t){.uri = "/", .method = HTTP_GET, .handler = root_handler});
        httpd_register_uri_handler(
            server,
            &(httpd_uri_t){.uri = "/upload", .method = HTTP_POST, .handler = upload_handler});
    }

    return server;
}

void app_main() {
    ESP_LOGI(TAG, "Starting Barrier Control (QEMU)");

    register_ethernet();

    server = start_webserver();
    if (server) {
        ESP_LOGI(TAG, "Web interface running at http://localhost:%d", WEBSERVER_PORT);
    } else {
        ESP_LOGE(TAG, "Failed to start HTTP server");
    }

    while (1) {
        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}
