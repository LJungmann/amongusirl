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
#define RADIOLIB_LORAWAN_DEV_EUI   0x70B3D57ED0070679
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


//game id
int gameID = 2;

// INPUT: Potentiometer should be connected to 5V and GND
int potPin = 34; // Potentiometer output connected to pin A0
int potVal = 0; // Variable to store the input from the potentiometer

// OUTPUT: LED feedback
int safePinLEDs[] = {27,4,26,25};

// OUTPUT: Buzzer
int buzzerPin = 33; // PWM pin for the buzzer

// safe CODE
int safePin[] = {2,2,7,2};
int safeIndex = 0;

// Victory melody notes and durations
// Musical note definitions
#define NOTE_C5  523
#define NOTE_E5  659
#define NOTE_G5  784
#define NOTE_C6  104
int victoryMelody[] = {NOTE_C5, NOTE_E5, NOTE_G5, NOTE_C6};
int victoryNoteDurations[] = {200, 200, 200, 400};

//generate List of Numbers for the safe
void generateNumList()
{
  int i;
  int num;
  for(i=0;i<=3;i++)
  {
    num = random(10);
    safePin[i] = num; //add random number 0-9 to list
  }
}

// Play victory melody
void playVictoryMelody() {
  for (int i = 0; i < 4; i++) {
    int noteDuration = victoryNoteDurations[i];
    tone(buzzerPin, victoryMelody[i], noteDuration);
    delay(noteDuration * 1.3); // Short pause between notes
    noTone(buzzerPin);
  }
}

//LoRa communication
void sendRadio(){
  String payloadStr = "{ \"completed\": true }";

  // In Byte-Array umwandeln
  int payloadLen = payloadStr.length();
  uint8_t payload[payloadLen + 1];  // Optional +1 für Nullterminator
  payloadStr.getBytes(payload, payloadLen + 1);

  // Nachricht über RadioLib senden
  int16_t message = node.sendReceive(payload, payloadLen);
  debug(message < RADIOLIB_ERR_NONE, F("Error in sendReceive"), message, false);
}

//check if the current number is correct
void checkIfNum(int num)
{
  if (num == safePin[safeIndex]) { // number correct
    //LED output
    digitalWrite(safePinLEDs[safeIndex],HIGH);
    
    // Play safe click sound
    tone(buzzerPin, 1000, 100); // High pitch click
    delay(100);
    tone(buzzerPin, 800, 100); // Lower pitch click
    delay(100);
    
    safeIndex++;
    delay(1800); // Reduced from 2000 to account for the sound delay
  } else {
    // Calculate how close we are to the correct value
    int targetRangeStart = safePin[safeIndex] * 102;
    int targetRangeEnd = targetRangeStart + 102;
    int distance = min(abs(potVal - targetRangeStart), abs(potVal - targetRangeEnd));
    
    /*
    // Map distance to volume (closer = louder)
    int volume = map(distance, 0, 512, 255, 0); // 255 is max volume, 0 is silent
    volume = constrain(volume, 0, 255);
    
    if (volume > 10) { // Only play if volume is above threshold
      // Play a tone with frequency based on distance and volume based on proximity
      int frequency = map(distance, 0, 512, 800, 200); // Higher pitch when closer
      analogWrite(buzzerPin, volume/2); // Set volume (PWM duty cycle)
      tone(buzzerPin, frequency);
    } else {
      noTone(buzzerPin); // Silence when not close
    }*/
  }
}


void reset()
{  
  generateNumList();
  safeIndex = 0;

  // turn off all LEDs and buzzer
  int i;
  for(i=0;i<=3;i++)
    digitalWrite(safePinLEDs[i],LOW);
  noTone(buzzerPin);
}

void setup()
{
  //TODO: Copy Lora Part into setup
  Serial.begin(115200);
  generateNumList();

  // sets the pins as output
  int i;
  for(i=0;i<=3;i++)
    pinMode(safePinLEDs[i],OUTPUT);
    
  pinMode(buzzerPin, OUTPUT);


  Serial.println("Starte Setup...");
  // LoRaWAN
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
}

// Main program
void loop()
{
  potVal = analogRead(potPin);   // read the potentiometer value at the input pin
  Serial.println(potVal);

  if (safeIndex < 4)
  {
    if (potVal < 411) //potentiometer's range (0-408) -> show 0
    {
      checkIfNum(0);
    }
    else if (potVal < 821) //potentiometer's range (103-204) -> show 1
    {
      checkIfNum(1);
    }
    else if (potVal < 1231) //potentiometer's range (205-306) -> show 2
    {
      checkIfNum(2);
    }
    else if (potVal < 1641) //potentiometer's range (307-409) -> show 3
    {
      checkIfNum(3);
    }
    else if (potVal < 2051) //potentiometer's range (410-511) -> show 4
    {
      checkIfNum(4);
    }
    else if (potVal < 2461) //potentiometer's range (512-614) -> show 5
    {
      checkIfNum(5);
    }
    else if (potVal < 2871) //potentiometer's range (615-716) -> show 6
    {
      checkIfNum(6);
    }
    else if (potVal < 3281) //potentiometer's range (717-818) -> show 7
    {
      checkIfNum(7);
    }
    else if (potVal < 3691) //potentiometer's range (819-921) -> show 8
    {
      checkIfNum(8);
    }
    else //potentiometer's range (922-1023) -> show 9
    {
      checkIfNum(9);
    }
  } else {
    noTone(buzzerPin); // Turn off any ongoing tones
    
    // Flash LEDs
    int i;
    for(i=0;i<=3;i++)
      digitalWrite(safePinLEDs[i],LOW);
    delay(500);
    for(i=0;i<=3;i++)
      digitalWrite(safePinLEDs[i],HIGH);
    delay(500);
    for(i=0;i<=3;i++)
      digitalWrite(safePinLEDs[i],LOW);
    delay(500);
    for(i=0;i<=3;i++)
      digitalWrite(safePinLEDs[i],HIGH);
    delay(500);
    
    // Play victory melody
    playVictoryMelody();
    sendRadio(); //TODO: auskommentieren und probieren
    reset();
  }
  
  // Small delay to prevent buzzing from being too choppy
  delay(10);
}