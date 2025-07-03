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
#define RADIOLIB_LORAWAN_DEV_EUI   0x70B3D57ED0070675
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



//#include <Wire.h>
//#include <Adafruit_GFX.h>
//#include <Adafruit_7segment.h>

//16 -23

const int ledPins[] = {27, 25, 32, 4}; //, 18, 19, 23};  // Pins für die Taster
const int numSwitches = 4;
const int switchPins[] = {26, 5, 23, 33};  // Beispiel: 4 LEDs an digitalen Pins
const int numLeds = numSwitches;

//Adafruit_7segment matrix = Adafruit_7segment(); // Objekt für das 7-Segment-Display

int correctSwitches[numSwitches];  // Array für die richtigen Schalter
int currentCorrect = 0;            // Zähler für die richtigen Schalter
bool gameFinished = false;


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

  resetLevers();
}



void loop() {

  if (!gameFinished) {

    currentCorrect = 0;
    for (int i = 0; i < numSwitches; i++) {
      if (digitalRead(switchPins[i]) == correctSwitches[i]) {
        currentCorrect++;
      }
    }

    Serial.print("Correct: ");
    Serial.println(currentCorrect);

    // LEDs je nach Anzahl richtig gesetzter Schalter aktivieren
    for (int i = 0; i < numLeds; i++) {
      if (i < currentCorrect) {
        digitalWrite(ledPins[i], HIGH); 
        delay(50);
      } else {
        digitalWrite(ledPins[i], LOW);
        delay(50);
      }
    }

    if(currentCorrect == numSwitches){
      String payloadStr = "{ \"completed\": true }";
       // Flash LEDs
      flashLEDs();
      // In Byte-Array umwandeln
      int payloadLen = payloadStr.length();
      uint8_t payload[payloadLen + 1];  // Optional +1 für Nullterminator
      payloadStr.getBytes(payload, payloadLen + 1);

      // Nachricht über RadioLib senden
      int16_t message = node.sendReceive(payload, payloadLen);
      debug(message < RADIOLIB_ERR_NONE, F("Error in sendReceive"), message, false);
      
      Serial.println("Payload versendet");
      gameFinished = true;

    }
      //delay(1000);
  } else{
    resetLevers();
    gameFinished = false;
    return;
  }

}
/*void setup() {
  // Seriellen Monitor starten
  Serial.begin(9600);

  // Schalter-Pins als Eingänge setzen
  for (int i = 0; i < numSwitches; i++) {
    pinMode(switchPins[i], INPUT_PULLUP);
  }

  // 7-Segment-Display initialisieren
  //matrix.begin(0x70); // I2C-Adresse des Displays

  // Zufällige Reihenfolge der richtigen Schalter festlegen
  randomSeed(analogRead(2345));
  for (int i = 0; i < numSwitches; i++) {
    correctSwitches[i] = random(0, 2); // 0 für falsch, 1 für richtig
  }

  // Zeige Anfangszustand auf dem Display
  //matrix.print(0);
  //matrix.writeDisplay();


}

void loop() {

  int switchState = digitalRead(26);
  Serial.println(switchState);

  // Anzahl der richtigen Schalter überprüfen
  currentCorrect = 0;
  for (int i = 0; i < numSwitches; i++) {
    if (digitalRead(switchPins[i]) == HIGH && correctSwitches[i] == 1) {
      currentCorrect++;
    }
  }

  Serial.print("Correct: ");
  Serial.println(currentCorrect);
  // Die Anzahl der richtigen Schalter auf dem Display anzeigen
  //matrix.print(currentCorrect);
  //matrix.writeDisplay();

  // Kurze Verzögerung, um das Display zu aktualisieren
  delay(1000);
}*/

void resetLevers(){
   for (int i = 0; i < numSwitches; i++) {
    pinMode(switchPins[i], INPUT_PULLUP);
  }

  for (int i = 0; i < numSwitches; i++) {
    correctSwitches[i] = random(2); // 0 für falsch, 1 für richtig
    Serial.println(correctSwitches[0]);
  }
   for (int i = 0; i < 4; i++) {
    pinMode(ledPins[i], OUTPUT);
    digitalWrite(ledPins[i], HIGH); // LEDs aus bei Start (weil active low)
  }
}


void flashLEDs(){
   int i;
      for(i=0;i<=3;i++)
        digitalWrite(ledPins[i],LOW);
      delay(500);
      for(i=0;i<=3;i++)
        digitalWrite(ledPins[i],HIGH);
      delay(500);
      for(i=0;i<=3;i++)
        digitalWrite(ledPins[i],LOW);
      delay(500);
      for(i=0;i<=3;i++)
        digitalWrite(ledPins[i],HIGH);
      delay(500);
      for(i=0;i<=3;i++)
        digitalWrite(ledPins[i],LOW);

}