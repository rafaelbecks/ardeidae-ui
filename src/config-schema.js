const schemaConfig = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "ble": {
      "type": "object",
      "title": "Bluetooth Configuration",
      "properties": {
        "targetServiceUuid": { "type": "string", "title": "Service UUID" },
        "targetCharacteristicUuidRead": { "type": "string", "title": "Characteristic UUID (Read)" },
        "targetCharacteristicUuidWrite": { "type": "string", "title": "Characteristic UUID (Write)" }
      }
    },
    "ring": {
      "type": "object",
      "title": "Ring Configuration",
      "properties": {
        "productName": { "type": "string", "title": "Product Name" },
        "hexMappings": {
          "type": "array",
          "title": "Hex Mappings",
          "items": {
            "type": "object",
            "properties": {
              "hex": { "type": "string", "title": "Hex Code" },
              "mapping": { "type": "integer", "title": "Mapping Value" }
            }
          }
        }
      }
    },
    "osc": {
      "type": "object",
      "title": "OSC Configuration",
      "properties": {
        "host": { "type": "string", "title": "Host", "format": "ipv4" },
        "port": { "type": "integer", "title": "Port", "minimum": 1, "maximum": 65535 }
      }
    }
  }
}


const uiSchema = {
  "layout": {
    "osc": {
      "orientation": "horizontal",
      "elements": ["host", "port"]
    }
  }
}



export { schemaConfig, uiSchema }


// <!-- <jsf-system
//     .schema=${schemaConfig}
//     .uischema=${uiSchema}
//     .data=${{
//       ble: {
//         targetServiceUuid: '0000ffe5-0000-1000-8000-00805f9a34fb',
//         targetCharacteristicUuidRead: '0000ffe4-0000-1000-8000-00805f9a34fb',
//         targetCharacteristicUuidWrite: '0000ffe9-0000-1000-8000-00805f9a34fb'
//       },
//       ring: {
//         productName: 'SR pius',
//         hexMappings: {
//           '02033880': 1, // UP
//           '0203d87f': 2 // DOWN
//         }
//       },
//       osc: {
//         host: '127.0.0.1',
//         port: 3333
//       }
//     }
// }>
//   </jsf-system> -->
