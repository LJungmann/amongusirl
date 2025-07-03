#include <RadioLib.h>
#include <SPI.h>

#ifndef _RADIOLIB_EX_LORAWAN_CONFIG_H
#define _RADIOLIB_EX_LORAWAN_CONFIG_H

#define LORA_SCK     16
#define LORA_MISO    17
#define LORA_MOSI    18
#define LORA_CS      19
#define LORA_RST     21
#define LORA_DIO0    22
#define LORA_DIO1    23 


// first you have to set your radio model and pin configuration
// this is provided just as a default example

SX1276 radio = new Module(LORA_CS, LORA_DIO0, LORA_RST, LORA_DIO1); // NSS, DIO0, RESET, DIO1

// if you have RadioBoards (https://github.com/radiolib-org/RadioBoards)
// and are using one of the supported boards, you can do the following:
/*
#define RADIO_BOARD_AUTO
#include <RadioBoards.h>

Radio radio = new RadioModule();
*/

// how often to send an uplink - consider legal & FUP constraints - see notes
const uint32_t uplinkIntervalSeconds = 1UL * 30UL;    // minutes x seconds

// joinEUI - previous versions of LoRaWAN called this AppEUI
// for development purposes you can use all zeros - see wiki for details
#define RADIOLIB_LORAWAN_JOIN_EUI  0x0000000000000000

// the Device EUI & two keys can be generated on the TTN console 
#ifndef RADIOLIB_LORAWAN_DEV_EUI   // Replace with your Device EUI
#define RADIOLIB_LORAWAN_DEV_EUI   0x70B3D57ED0070437
#endif
#ifndef RADIOLIB_LORAWAN_APP_KEY   // Replace with your App Key 
#define RADIOLIB_LORAWAN_APP_KEY   // HERE
#endif
#ifndef RADIOLIB_LORAWAN_NWK_KEY   // Put your Nwk Key here
#define RADIOLIB_LORAWAN_NWK_KEY   // HERE
#endif

// for the curious, the #ifndef blocks allow for automated testing &/or you can
// put your EUI & keys in to your platformio.ini - see wiki for more tips

// regional choices: EU868, US915, AU915, AS923, AS923_2, AS923_3, AS923_4, IN865, KR920, CN470
const LoRaWANBand_t Region = EU868;

// subband choice: for US915/AU915 set to 2, for CN470 set to 1, otherwise leave on 0
const uint8_t subBand = 0;

// ============================================================================
// Below is to support the sketch - only make changes if the notes say so ...

// copy over the EUI's & keys in to the something that will not compile if incorrectly formatted
uint64_t joinEUI =   RADIOLIB_LORAWAN_JOIN_EUI;
uint64_t devEUI  =   RADIOLIB_LORAWAN_DEV_EUI;
uint8_t appKey[] = { RADIOLIB_LORAWAN_APP_KEY };
uint8_t nwkKey[] = { RADIOLIB_LORAWAN_NWK_KEY };

// create the LoRaWAN node
LoRaWANNode node(&radio, &Region, subBand);

// result code to text - these are error codes that can be raised when using LoRaWAN
// however, RadioLib has many more - see https://jgromes.github.io/RadioLib/group__status__codes.html for a complete list
String stateDecode(const int16_t result) {
  switch (result) {
  case RADIOLIB_ERR_NONE:
    return "ERR_NONE";
  case RADIOLIB_ERR_CHIP_NOT_FOUND:
    return "ERR_CHIP_NOT_FOUND";
  case RADIOLIB_ERR_PACKET_TOO_LONG:
    return "ERR_PACKET_TOO_LONG";
  case RADIOLIB_ERR_RX_TIMEOUT:
    return "ERR_RX_TIMEOUT";
  case RADIOLIB_ERR_CRC_MISMATCH:
    return "ERR_CRC_MISMATCH";
  case RADIOLIB_ERR_INVALID_BANDWIDTH:
    return "ERR_INVALID_BANDWIDTH";
  case RADIOLIB_ERR_INVALID_SPREADING_FACTOR:
    return "ERR_INVALID_SPREADING_FACTOR";
  case RADIOLIB_ERR_INVALID_CODING_RATE:
    return "ERR_INVALID_CODING_RATE";
  case RADIOLIB_ERR_INVALID_FREQUENCY:
    return "ERR_INVALID_FREQUENCY";
  case RADIOLIB_ERR_INVALID_OUTPUT_POWER:
    return "ERR_INVALID_OUTPUT_POWER";
  case RADIOLIB_ERR_NETWORK_NOT_JOINED:
	  return "RADIOLIB_ERR_NETWORK_NOT_JOINED";
  case RADIOLIB_ERR_DOWNLINK_MALFORMED:
    return "RADIOLIB_ERR_DOWNLINK_MALFORMED";
  case RADIOLIB_ERR_INVALID_REVISION:
    return "RADIOLIB_ERR_INVALID_REVISION";
  case RADIOLIB_ERR_INVALID_PORT:
    return "RADIOLIB_ERR_INVALID_PORT";
  case RADIOLIB_ERR_NO_RX_WINDOW:
    return "RADIOLIB_ERR_NO_RX_WINDOW";
  case RADIOLIB_ERR_INVALID_CID:
    return "RADIOLIB_ERR_INVALID_CID";
  case RADIOLIB_ERR_UPLINK_UNAVAILABLE:
    return "RADIOLIB_ERR_UPLINK_UNAVAILABLE";
  case RADIOLIB_ERR_COMMAND_QUEUE_FULL:
    return "RADIOLIB_ERR_COMMAND_QUEUE_FULL";
  case RADIOLIB_ERR_COMMAND_QUEUE_ITEM_NOT_FOUND:
    return "RADIOLIB_ERR_COMMAND_QUEUE_ITEM_NOT_FOUND";
  case RADIOLIB_ERR_JOIN_NONCE_INVALID:
    return "RADIOLIB_ERR_JOIN_NONCE_INVALID";
  case RADIOLIB_ERR_N_FCNT_DOWN_INVALID:
    return "RADIOLIB_ERR_N_FCNT_DOWN_INVALID";
  case RADIOLIB_ERR_A_FCNT_DOWN_INVALID:
    return "RADIOLIB_ERR_A_FCNT_DOWN_INVALID";
  case RADIOLIB_ERR_DWELL_TIME_EXCEEDED:
    return "RADIOLIB_ERR_DWELL_TIME_EXCEEDED";
  case RADIOLIB_ERR_CHECKSUM_MISMATCH:
    return "RADIOLIB_ERR_CHECKSUM_MISMATCH";
  case RADIOLIB_ERR_NO_JOIN_ACCEPT:
    return "RADIOLIB_ERR_NO_JOIN_ACCEPT";
  case RADIOLIB_LORAWAN_SESSION_RESTORED:
    return "RADIOLIB_LORAWAN_SESSION_RESTORED";
  case RADIOLIB_LORAWAN_NEW_SESSION:
    return "RADIOLIB_LORAWAN_NEW_SESSION";
  case RADIOLIB_ERR_NONCES_DISCARDED:
    return "RADIOLIB_ERR_NONCES_DISCARDED";
  case RADIOLIB_ERR_SESSION_DISCARDED:
    return "RADIOLIB_ERR_SESSION_DISCARDED";
  }
  return "See https://jgromes.github.io/RadioLib/group__status__codes.html";
}

// helper function to display any issues
void debug(bool failed, const __FlashStringHelper* message, int state, bool halt) {
  if(failed) {
    Serial.print(message);
    Serial.print(" - ");
    Serial.print(stateDecode(state));
    Serial.print(" (");
    Serial.print(state);
    Serial.println(")");
    while(halt) { delay(1); }
  }
}

// helper function to display a byte array
void arrayDump(uint8_t *buffer, uint16_t len) {
  for(uint16_t c = 0; c < len; c++) {
    char b = buffer[c];
    if(b < 0x10) { Serial.print('0'); }
    Serial.print(b, HEX);
  }
  Serial.println();
}

#endif


//16 - 23



// Pins definieren
int pinA[] = {25, 26, 27, 4};  // Ausgänge
int pinB[] = {32, 33, 34, 35};  // Eingänge
//const int ledPin = ;

const int wiresToConnect = 4;
int mapping[wiresToConnect];
int pinB_shuffled[wiresToConnect];
bool gameFinished = false;




void shuffleArray(int *array, size_t size) {
  for (int i = size - 1; i > 0; i--) {
    int j = random(0, i + 1);
    int temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}


void setup() {
  Serial.begin(9600);
  Serial.println("Starte Setup...");
  SPI.begin(LORA_SCK, LORA_MISO, LORA_MOSI, LORA_CS);  

  Serial.println(F("Initialise the radio"));
  int16_t state = radio.begin();
  debug(state != RADIOLIB_ERR_NONE, F("Initialise radio failed"), state, true);

  // Setup the OTAA session information
  state = node.beginOTAA(joinEUI, devEUI, nwkKey, appKey);
  debug(state != RADIOLIB_ERR_NONE, F("Initialise node failed"), state, true);

  Serial.println(F("Join ('login') the LoRaWAN Network"));
  state = node.activateOTAA();
  debug(state != RADIOLIB_LORAWAN_NEW_SESSION, F("Join failed"), state, true);

  Serial.println(F("Ready!\n"));


  // Random Wire Setup
  randomSeed(analogRead(2345));  // Zufälliger Startwert

  
  // LED als OUTPUT
  //pinMode(ledPin, OUTPUT);

  shuffleWires(); 


}

void loop() {
if (!gameFinished) {

  bool allCorrect = true;

  // Alle pinA auf HIGH setzen, nacheinander prüfen
  for (int i = 0; i < wiresToConnect; i++) {
    // Setze aktuellen Pin HIGH
    digitalWrite(pinA[i], HIGH);
    delay(10); // kurze Stabilisierung

    // Prüfe, ob das korrekte Gegenstück auch HIGH ist
    if (digitalRead(pinB_shuffled[i]) != HIGH) {
      allCorrect = false;
    }

    // Setze wieder auf LOW
    digitalWrite(pinA[i], LOW);
  }

  // LED steuern
  if (allCorrect) {
    //digitalWrite(ledPin, HIGH);
    Serial.println("Alle Kabel richtig verbunden!");
    // Schritt: JSON-Nachricht bei Spielende vorbereiten
    String payloadStr = "{ \"completed\": true }";

    // In Byte-Array umwandeln
    int payloadLen = payloadStr.length();
    uint8_t payload[payloadLen + 1];  // Optional +1 für Nullterminator
    payloadStr.getBytes(payload, payloadLen + 1);

    // Nachricht über RadioLib senden
    int16_t message = node.sendReceive(payload, payloadLen);
    debug(message < RADIOLIB_ERR_NONE, F("Error in sendReceive"), message, false);
    
    gameFinished = true;

  } else {
    //digitalWrite(ledPin, LOW);
    Serial.println("Fehlerhafte Verbindung!");
  }

  delay(2000); // kurze Pause
  }else{
    gameFinished = false;
    shuffleWires(); 
    return;
  }
}


void shuffleWires(){
  for (int i = 0; i < wiresToConnect; i++) {
    mapping[i] = i;
  }
  shuffleArray(mapping, wiresToConnect);

  for (int i = 0; i < wiresToConnect; i++) {
    pinB_shuffled[i] = pinB[mapping[i]];
  }

  // Schritt 2: Mapping senden
  // First, construct the payload string
  String payloadStr = "{ \"settings\": \"";
  for (int i = 0; i < wiresToConnect; i++) {
    payloadStr += String(mapping[i]);
    if (i < wiresToConnect - 1) payloadStr += ",";
  }
  payloadStr += "\" }";

  // Convert String to byte array
  int payloadLen = payloadStr.length();
  uint8_t payload[payloadLen + 1];  // +1 for null terminator if needed (optional)
  payloadStr.getBytes(payload, payloadLen + 1);

  // Send using RadioLib LoRaWAN
  int16_t message = node.sendReceive(payload, payloadLen);
  debug(message < RADIOLIB_ERR_NONE, F("Error in sendReceive"), message, false);
  
  // Debug-Ausgabe
  Serial.print("Verkabelung (pinA[i] -> pinB[mapping[i]]): ");
  for (int i = 0; i < wiresToConnect; i++) {
    Serial.print("A");
    Serial.print(i);
    Serial.print("->B");
    Serial.print(mapping[i]);
    if (i < wiresToConnect - 1) Serial.print(", ");
  }
  Serial.println();

  // Pins konfigurieren
  for (int i = 0; i < wiresToConnect; i++) {
    pinMode(pinA[i], OUTPUT);
    pinMode(pinB_shuffled[i], INPUT_PULLDOWN);
  }

}