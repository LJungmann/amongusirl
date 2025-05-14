import { gameStateData, playerData } from "./App";

/**
 * Checks if the player is an imposter.
 * @param playerId - The playerId to check. Defaults to the current playerId.
 * @returns True if the player is an imposter, false otherwise.
 */
export function isPlayerImposter(playerId: number = playerData().playerId) {
	return (
		gameStateData().imposterPlayerId.findIndex(
			(x) => x.playerId === playerId,
		) !== -1
	);
}

/**
 * Checks if the player is alive.
 * @param playerId - The playerId to check. Defaults to the current playerId.
 * @returns True if the player is alive, false otherwise.
 */
export function isPlayerAlive(playerId: number = playerData().playerId) {
	return (
		gameStateData().alivePlayers.findIndex((x) => x.playerId === playerId) !==
		-1
	);
}

/**
 * Checks if the player is registered for voting.
 * @param playerId - The playerId to check. Defaults to the current playerId.
 * @returns True if the player is registered for voting, false otherwise.
 */
export function isPlayerRegisteredForVoting(
	playerId: number = playerData().playerId,
) {
	return (
		gameStateData().playersRegisteredForVoting.findIndex(
			(x) => x === playerId,
		) !== -1
	);
}

/**
 * Get the tasks for a player.
 * @param playerId - The playerId to check. Defaults to the current playerId.
 * @returns A string array of station IDs that the player needs to complete.
 */
export function getTasks(playerId: number = playerData().playerId) {
	const player = gameStateData().playersNeededStations.find(
		(x) => x.playerId === playerId,
	);
	if (player) {
		return player.stationIds;
	}
	return [];
}

/**
 * Checks if the player is registered for voting.
 * @param stationId The station ID to check.
 * @param playerId The player ID to check. Defaults to the current player ID.
 * @returns True if the station ID is valid for the player, false otherwise.
 */
export function isValidStation(
	stationId: string,
	playerId: number = playerData().playerId,
) {
	return getTasks(playerId).findIndex((x) => x === stationId) !== -1;
}
