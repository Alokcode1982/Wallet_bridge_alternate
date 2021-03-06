define({ "api": [
  {
    "type": "get",
    "url": "/health",
    "title": "Request User information",
    "name": "health",
    "group": "bridge",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "none",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "Success",
            "description": "<p>204</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/http.ts",
    "groupTitle": "bridge"
  },
  {
    "type": "get",
    "url": "/hello",
    "title": "Request User information",
    "name": "hello",
    "group": "bridge",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "none",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  Welcome to NFT MarketPlace Bridge v1.0\n\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/http.ts",
    "groupTitle": "bridge"
  },
  {
    "type": "get",
    "url": "/info",
    "title": "Request User information",
    "name": "info",
    "group": "bridge",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "none",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"name\": \"WalletConnect Bridge Server\",\n   \"description\": \"Server Description\",\n    \"version\": \"1.0\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/http.ts",
    "groupTitle": "bridge"
  },
  {
    "type": "get",
    "url": "/mode",
    "title": "Request User information",
    "name": "mode",
    "group": "bridge",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "none",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  RELAY_MODE: any\n\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/http.ts",
    "groupTitle": "bridge"
  },
  {
    "type": "post",
    "url": "/subscribe",
    "title": "Request for Subscription",
    "name": "subscribe",
    "group": "bridge",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "topic",
            "description": "<p>&lt;client_id&gt;</p>"
          },
          {
            "group": "Parameter",
            "optional": false,
            "field": "webhook",
            "description": "<p>&lt;push_notification_webhook&gt;</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": true\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/http.ts",
    "groupTitle": "bridge"
  }
] });
