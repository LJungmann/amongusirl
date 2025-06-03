import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { AppService } from 'src/app.service';
import { Wiring } from 'src/model/wiring/Wiring';
import { WiresService } from 'src/wires/wires.service';

@Injectable()
export class MqttBridgeService implements OnModuleInit {
  private ttnClient: mqtt.MqttClient;
  private localClient: mqtt.MqttClient;

  constructor(
    private appService: AppService,
    private wiresService: WiresService,
    private configService: ConfigService,
  ) {}

  onModuleInit() {
    this.connectToTTN();
    this.connectToLocalBroker();
  }

  private connectToTTN() {
    const ttnAppId = 'amongusirl@ttn';
    const ttnApiKey = this.configService.get('API_KEY');

    this.ttnClient = mqtt.connect('mqtts://eu1.cloud.thethings.network:8883', {
      username: ttnAppId,
      password: ttnApiKey,
    });

    this.ttnClient.on('connect', () => {
      console.log('✅ Connected with TTN MQTT');
      this.ttnClient.subscribe('#');
    });

    this.ttnClient.on('message', (topic, payload) => {
      console.log(`📨 TTN-Message: ${topic}`);

      let parsedTopic = this.parseTopic(topic);
      let game_id = parsedTopic[0];
      let intent = parsedTopic[1];
      if (intent === 'join') {
        console.log('join request, exiting');
        return;
      }
      try {
        const message = JSON.parse(payload.toString());
        console.log(`📨 [${topic}]`, message);
        let uplink_message = message.uplink_message;
        if (uplink_message !== undefined) {
          console.log(uplink_message.decoded_payload);
        }
        if (game_id === 'wires') {
          console.log('message from wires received ✅');
          let text = uplink_message.decoded_payload.text;
          console.log(JSON.parse(text));
          let settings = JSON.parse(text);
          if (settings.completed) {
            this.completeGame('wires');
          } else if (settings.settings !== undefined) {
            let wiring_right = settings.settings.split(',');
            let wiring = new Wiring();
            wiring.wiring = [
              [0, wiring_right[0]],
              [1, wiring_right[1]],
              [2, wiring_right[2]],
              [3, wiring_right[3]],
            ];
            this.wiresService.saveWiring(wiring);
          } else {
            console.error(
              '❌ sent a message that is not valid to be processed',
              text,
            );
          }
        } else if (game_id === 'simon') {
          console.log('message from simon received ✅');
          let text = uplink_message.decoded_payload.text;
          console.log(JSON.parse(text));
          let settings = JSON.parse(text);
          if (settings.completed) {
            this.completeGame('simon');
          }
        } else if (game_id === 'levers') {
          console.log('message from levers received ✅');
          let text = uplink_message.decoded_payload.text;
          console.log(JSON.parse(text));
          let settings = JSON.parse(text);
          if (settings.completed) {
            this.completeGame('levers');
          }
        } else if (game_id === 'lightsout') {
          console.log('message from lightsout received ✅');
          let text = uplink_message.decoded_payload.text;
          console.log(JSON.parse(text));
          let settings = JSON.parse(text);
          if (settings.completed) {
            this.completeGame('lightsout');
          }
        } else if (game_id === 'safecrack') {
          console.log('message from safecrack received ✅');
          let text = uplink_message.decoded_payload.text;
          console.log(JSON.parse(text));
          let settings = JSON.parse(text);
          if (settings.completed) {
            this.completeGame('safecrack');
          }
        } else if (game_id === 'emergency') {
          console.log('message from emergency received ✅');
          let text = uplink_message.decoded_payload.text;
          console.log(JSON.parse(text));
          this.appService.emergencyButton();
        }
      } catch (error) {
        console.error('❌ Error during json parsing:', error);
      }
      this.forwardToLocalBroker(topic, payload);
    });
  }

  private parseTopic(topic: string): [string, string] {
    let split_topic = topic.split('/');
    if (split_topic.length >= 2) {
      return [
        split_topic[split_topic.length - 2],
        split_topic[split_topic.length - 1],
      ];
    } else {
      return ['N/A', 'N/A'];
    }
  }

  private completeGame(game_id: string) {
    this.appService.completeStation(game_id);
  }

  private connectToLocalBroker() {
    this.localClient = mqtt.connect('mqtt://192.168.1.1:1883'); // ggf. mit Auth

    this.localClient.on('connect', () => {
      console.log('✅ Connected with local MQTT-Broker');
    });
  }

  private forwardToLocalBroker(topic: string, message: Buffer) {
    const newTopic = `ttn/${topic}`; // Optional: Mapping
    this.localClient.publish(newTopic, message);
  }
}
