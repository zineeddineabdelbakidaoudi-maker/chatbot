import fs from "fs";
import path from "path";

let cachedLore = null;
let cachedTeam = null;
let cachedChunks = null;

/**
 * Load the HxH knowledge base
 */
export function loadLore() {
  if (cachedLore) return cachedLore;
  const filePath = path.join(process.cwd(), "data", "hunterxhunter_lore.json");
  cachedLore = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return cachedLore;
}

/**
 * Load team profiles
 */
export function loadTeamProfiles() {
  if (cachedTeam) return cachedTeam;
  const filePath = path.join(process.cwd(), "data", "team_profiles.json");
  cachedTeam = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return cachedTeam;
}

/**
 * Chunk knowledge base entries for retrieval.
 * Each lore entry becomes one chunk with metadata.
 */
export function getChunks() {
  if (cachedChunks) return cachedChunks;

  const lore = loadLore();
  const team = loadTeamProfiles();

  cachedChunks = [];

  // Process HxH lore
  for (const entry of lore) {
    cachedChunks.push({
      id: entry.id,
      category: entry.category,
      title: entry.title,
      content: entry.content,
      keywords: entry.keywords || [],
      text: `${entry.title}: ${entry.content}`, // full text for BM25 search
    });
  }

  // Process team profiles as a single chunk
  const teamText = team
    .map(
      (m) =>
        `${m.full_name} is a ${m.academic_level} student aged ${m.age} at ${m.university_name}, studying ${m.field_of_study}.`
    )
    .join(" ");

  cachedChunks.push({
    id: "team_profiles",
    category: "team",
    title: "Team Members",
    content: teamText,
    keywords: ["team", "members", "students", "university"],
    text: `Team Members: ${teamText}`,
  });

  // Also add individual team member chunks
  for (let i = 0; i < team.length; i++) {
    const m = team[i];
    const memberText = `${m.full_name} is a team member. Academic level: ${m.academic_level}. Age: ${m.age}. University: ${m.university_name}. Field of study: ${m.field_of_study}.`;
    cachedChunks.push({
      id: `team_member_${i}`,
      category: "team",
      title: m.full_name,
      content: memberText,
      keywords: ["team", m.full_name.toLowerCase()],
      text: memberText,
    });
  }

  return cachedChunks;
}

/**
 * Get formatted team info string
 */
export function getTeamInfoString() {
  const team = loadTeamProfiles();
  return team
    .map(
      (m, i) =>
        `${i + 1}. ${m.full_name} — ${m.academic_level}, Age ${m.age}, ${m.university_name}, ${m.field_of_study}`
    )
    .join("\n");
}
