'use client';

import { useBaseMutation, useBaseQuery } from '@/services/_helpers';

export interface CandidateResultItem {
  candidateId: string;
  candidateName: string;
  total: number;
  percentage: number;
}

export interface CollationItem {
  id?: string;
  levelMappingId: string;
  electionId: string;
  spoiltBallot: number;
  pathToResultsImage?: string;
  status: boolean; // verified status
  results: CandidateResultItem[];
}

export interface ElectionCollationSummaryData {
  electionId: string;
  levelMappingId?: string | null;
  levelMappingName?: string | null;
  sheetsCounted: number;
  totalValidVotes: number;
  totalSpoiltBallots: number;
  totalVotesCast: number;
  results: CandidateResultItem[];
  collation?: CollationItem | null;
}

export interface CreateElectionCollationPayload {
  id?: string;
  levelMappingId: string;
  electionId: string;
  spoiltBallot: number;
  pathToResultsImage?: string;
  status: boolean;
  results: CandidateResultItem[];
}

// --- Queries ---

export function useGetElectionCandidateResults(
  electionId?: string,
  verifiedOnly: boolean = false,
) {
  return useBaseQuery<ElectionCollationSummaryData>(
    [
      'election-collations',
      'election',
      electionId,
      verifiedOnly ? 'verified' : 'all',
    ],
    () =>
      `/election-collations/election/${electionId}/candidates?verifiedOnly=${verifiedOnly}`,
    {
      enabled: Boolean(electionId),
      refetchInterval: 15000, // live background refetching
    },
  );
}

export function useGetResultsByLevelMapping(
  levelMappingId?: string,
  verifiedOnly: boolean = false,
) {
  return useBaseQuery<ElectionCollationSummaryData>(
    [
      'election-collations',
      'level-mapping',
      levelMappingId,
      verifiedOnly ? 'verified' : 'all',
    ],
    () =>
      `/election-collations/level-mapping/${levelMappingId}?verifiedOnly=${verifiedOnly}`,
    {
      enabled: Boolean(levelMappingId),
    },
  );
}

export function useGetResultsForCandidate(
  electionId?: string,
  candidateId?: string,
  verifiedOnly: boolean = false,
) {
  return useBaseQuery<ElectionCollationSummaryData>(
    [
      'election-collations',
      'candidate',
      electionId,
      candidateId,
      verifiedOnly ? 'verified' : 'all',
    ],
    () =>
      `/election-collations/election/${electionId}/candidates/${candidateId}?verifiedOnly=${verifiedOnly}`,
    {
      enabled: Boolean(electionId && candidateId),
    },
  );
}

// --- Mutations ---

export interface VerifyElectionCollationPayload {
  collationId: string;
  electionId: string;
  levelMappingId: string;
}

export function useVerifyElectionCollation() {
  return useBaseMutation<CollationItem, VerifyElectionCollationPayload>(
    ['verify-election-collation'],
    (payload) => `/election-collations/${payload.collationId}/verify`,
    'put',
    (payload) => [
      ['election-collations'],
      ['election-collations', 'election', payload.electionId],
      ['election-collations', 'level-mapping', payload.levelMappingId],
    ],
    {
      transformPayload: () => undefined,
    },
  );
}

export function useCreateElectionCollation() {
  return useBaseMutation<
    ElectionCollationSummaryData,
    CreateElectionCollationPayload
  >(
    ['create-election-collation'],
    () => '/election-collations',
    'post',
    (payload) => [
      ['election-collations'],
      ['election-collations', 'election', payload.electionId],
      ['election-collations', 'level-mapping', payload.levelMappingId],
    ],
    {
      transformPayload: (payload) => ({
        id: payload.id || crypto.randomUUID(),
        levelMappingId: payload.levelMappingId,
        electionId: payload.electionId,
        spoiltBallot: Number(payload.spoiltBallot || 0),
        pathToResultsImage: payload.pathToResultsImage || '/',
        status: Boolean(payload.status),
        results: (payload.results || []).map((r) => ({
          candidateId: r.candidateId,
          candidateName: r.candidateName,
          total: Number(r.total || 0),
          percentage: Number(r.percentage || 0),
        })),
      }),
    },
  );
}
