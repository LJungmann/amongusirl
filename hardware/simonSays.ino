#include <RadioLib.h>
#include <SPI.h>

#ifndef _RADIOLIB_EX_LORAWAN_CONFIG_H
#define _RADIOLIB_EX_LORAWAN_CONFIG_H

#define LORA_SCK     18
#define LORA_MISO    19
#define LORA_MOSI    23
#define LORA_CS      5
#define LORA_RST     21
#define LORA_DIO0    32
#define LORA_DIO1    33 


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
#define RADIOLIB_LORAWAN_DEV_EUI   0x70B3D57ED0070674
#endif
#ifndef RADIOLIB_LORAWAN_APP_KEY   // Replace with your App Key 
#define RADIOLIB_LORAWAN_APP_KEY   0x04, 0x50, 0x61, 0x79, 0x3A, 0xC0, 0x4B, 0x4F, 0xC7, 0xB6, 0xEF, 0x73, 0xE7, 0x6A, 0xF9, 0x4A
#endif
#ifndef RADIOLIB_LORAWAN_NWK_KEY   // Put your Nwk Key here
#define RADIOLIB_LORAWAN_NWK_KEY   0x3C, 0x5C, 0xE5, 0x3F, 0x8C, 0x08, 0x1D, 0xCD, 0x79, 0x57, 0x1E, 0xF8, 0xDF, 0x66, 0xBA, 0x51
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

// Define the pins for buttons and LEDs
const int buttonPins[] = {12, 14, 27, 26};  // GPIO pins for buttons
const int ledPins[] = {13, 15, 2, 4};      // GPIO pins for LEDs


// Game variables
int sequence[100];        // Stores the sequence of lights
int level = 1;            // Current level
const int maxLevel = 7;   // Maximum level before game resets
int inputCount = 0;       // How many buttons the player has pressed
bool gameStarted = false; // Flag to check if game is running
const int gameID = 3;     // Unique identifier for this game

void sendRadio(){
  String payloadStr = "{ "completed": true }";

  // In Byte-Array umwandeln
  int payloadLen = payloadStr.length();
  uint8_t payload[payloadLen + 1];  // Optional +1 für Nullterminator
  payloadStr.getBytes(payload, payloadLen + 1);

  // Nachricht über RadioLib senden
  int16_t message = node.sendReceive(payload, payloadLen);
  debug(message < RADIOLIB_ERR_NONE, F("Error in sendReceive"), message, false);
}

void setup() {
  Serial.begin(115200);
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
  // Initialize buttons and LEDs
  for (int i = 0; i < 4; i++) {
    pinMode(buttonPins[i], INPUT_PULLUP);  // Buttons are INPUT_PULLUP
    pinMode(ledPins[i], OUTPUT);           // LEDs are OUTPUT
    digitalWrite(ledPins[i], LOW);         // Turn off all LEDs initially
  }
  
  //Set up of communication
  int16_t state = radio.begin();
  debug(state != RADIOLIB_ERR_NONE, F("Initialise radio failed"), state, true);

  // Setup the OTAA session information
  state = node.beginOTAA(0000000000000000, 70B3D57ED0070437, 835AF8DA6AA372DFDB2849D71F8D6BAD, 66B638FB0D4AEA978C05572D7C4FCDC1);
  debug(state != RADIOLIB_ERR_NONE, F("Initialise node failed"), state, true);

  Serial.println(F("Join ('login') the LoRaWAN Network"));
  state = node.activateOTAA();
  debug(state != RADIOLIB_LORAWAN_NEW_SESSION, F("Join failed"), state, true);

  Serial.println(F("Ready!\n"));
  /*
  // Initialize LoRa
  LoRa.setPins(csPin, resetPin, irqPin);
  if (!LoRa.begin(868E6)) { // Change frequency to match your region
    Serial.println("LoRa init failed. Check your connections.");
    while (true); // halt if LoRa failed
  }
  Serial.println("LoRa init succeeded.");
  */
  // Seed the random number generator
  randomSeed(analogRead(0));
  
  Serial.println("Press any button to start the game!");
}

void loop() {
  // Start the game when any button is pressed
  if (!gameStarted) {
    for (int i = 0; i < 4; i++) {
      if (digitalRead(buttonPins[i]) == LOW) {
        delay(200);  // Debounce
        gameStarted = true;
        startGame();
        break;
      }
    }
    return;
  }
  
  // Game is running
  checkPlayerInput();
}

void startGame() {
  level = 1;
  inputCount = 0;
  generateSequence();
  playSequence();
}

void generateSequence() {
  for (int i = 0; i < 100; i++) {
    sequence[i] = random(0, 4);  // Random number between 0 and 3
  }
}

void playSequence() {
  // Turn off all LEDs first
  allLedsOff();
  delay(500);
  
  // Play the sequence up to the current level
  for (int i = 0; i < level; i++) {
    digitalWrite(ledPins[sequence[i]], HIGH);
    delay(500);
    digitalWrite(ledPins[sequence[i]], LOW);
    delay(300);
  }
}

void checkPlayerInput() {
  for (int i = 0; i < 4; i++) {
    if (digitalRead(buttonPins[i]) == LOW) {
      delay(200);  // Debounce
      
      // Light up the corresponding LED
      digitalWrite(ledPins[i], HIGH);
      delay(300);
      digitalWrite(ledPins[i], LOW);
      
      // Check if the button matches the sequence
      if (i != sequence[inputCount]) {
        gameOver();
        return;
      }
      
      inputCount++;
      
      // Check if level is complete
      if (inputCount == level) {
        if (level == maxLevel) {
          gameComplete();
        } else {
          levelComplete();
        }
        return;
      }
    }
  }
}

void levelComplete() {
  // Celebrate level completion
  for (int i = 0; i < 3; i++) {
    allLedsOn();
    delay(200);
    allLedsOff();
    delay(200);
  }
  
  // Move to next level
  level++;
  inputCount = 0;
  delay(1000);
  playSequence();
}

void gameComplete() {
  // Special celebration for completing all levels
  for (int i = 0; i < 5; i++) {
    for (int j = 0; j < 4; j++) {
      digitalWrite(ledPins[j], HIGH);
      delay(100);
      digitalWrite(ledPins[j], LOW);
    }
  }
  sendRadio();
  Serial.println("Congratulations! You completed all 7 levels!");
  
  
  // Reset game with new sequence
  resetGame();
}

void gameOver() {
  // Show game over pattern
  for (int i = 0; i < 5; i++) {
    allLedsOn();
    delay(100);
    allLedsOff();
    delay(100);
  }
  
  Serial.print("Game Over! You reached level ");
  Serial.println(level);
  
  // Reset game
  resetGame();
}

void resetGame() {
  gameStarted = false;
  Serial.println("Press any button to play again!");
}

void allLedsOn() {
  for (int i = 0; i < 4; i++) {
    digitalWrite(ledPins[i], HIGH);
  }
}

void allLedsOff() {
  for (int i = 0; i < 4; i++) {
    digitalWrite(ledPins[i], LOW);
  }
}