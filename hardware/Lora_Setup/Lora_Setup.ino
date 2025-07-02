#include <LoRa.h>
#include <SPI.h>


#define LORA_SCK     27
#define LORA_MISO    34
#define LORA_MOSI    25
#define LORA_CS      5
#define LORA_RST     32
#define LORA_DIO0    2

void setup() {
  Serial.begin(9600);
  Serial.println("Starte Setup...");
  SPI.begin(LORA_SCK, LORA_MISO, LORA_MOSI, LORA_CS);  

  LoRa.setPins(LORA_CS, LORA_RST, LORA_DIO0);
  if (!LoRa.begin(868E6)) {
    Serial.println("LoRa Start fehlgeschlagen!");
    while (true);
  }

  Serial.println("LoRa bereit.");
}



void loop() {
  Serial.println("Sende Paket...");

  LoRa.beginPacket();
  LoRa.setSyncWord(0xF5);
  LoRa.print("Hey :)");
  LoRa.endPacket();

  delay(2000); // Alle 2 Sekunden senden
}