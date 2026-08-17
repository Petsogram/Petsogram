export function getJoinedCommunities(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(`petsogram_communities_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function isMember(userId, communityId) {
  const communities = getJoinedCommunities(userId);
  return communities.includes(communityId);
}

export function joinCommunity(userId, communityId) {
  if (!userId || !communityId) return false;
  const communities = getJoinedCommunities(userId);
  if (!communities.includes(communityId)) {
    communities.push(communityId);
    localStorage.setItem(`petsogram_communities_${userId}`, JSON.stringify(communities));
    return true;
  }
  return false;
}

export function leaveCommunity(userId, communityId) {
  if (!userId || !communityId) return false;
  let communities = getJoinedCommunities(userId);
  communities = communities.filter(id => id !== communityId);
  localStorage.setItem(`petsogram_communities_${userId}`, JSON.stringify(communities));
  return true;
}
