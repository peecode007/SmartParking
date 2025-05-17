idf_component_register(
    SRCS "emulation.c"
    INCLUDE_DIRS "."
    REQUIRES json esp_http_client esp_http_server esp_netif nvs_flash esp_eth esp-tls
)
