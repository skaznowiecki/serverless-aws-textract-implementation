import { Block, Relationship } from "@aws-sdk/client-textract";
import { Document, DocumentConfig } from "./entities";


interface Answer {
    text: string;
    confidence: number;
}

export const documentTextractParser = (
    blocks: Block[],
    configs: DocumentConfig[]
): Document["result"] => {
    const queries = configs
        .filter((c) => c.type === "query")
        .reduce((accum, config) => {
            const { sk, query } = config;

            const answers = query!.reduce((qAccum, q) => {
                return [...qAccum, ...searchInBlocks(blocks, q)];
            }, [] as Answer[]);

            accum[sk] = answers
                .sort((a, b) => b.confidence - a.confidence)
                .map((a) => a.text);

            return accum;
        }, {} as Record<string, string[]>);

    const existances = configs
        .filter((c) => c.type === "existance")
        .reduce((accum, config) => {
            const { sk } = config;
            accum[sk] = searchExistanceInLines(blocks, sk);

            return accum;
        }, {} as Record<string, boolean>);

    return {
        ...queries,
        ...existances,
    };
};


// Helper functions

const findAnswerQueryBlock = (
    blocks: Block[],
    fieldToSearch: string
): Relationship[] | undefined => {
    const filteredBlock = blocks.find((block) => {
        return block.BlockType === "QUERY" && block.Query?.Text === fieldToSearch;
    });

    if (!filteredBlock) {
        return;
    }

    return filteredBlock.Relationships?.filter((r) => r.Type === "ANSWER");
};

const findAnswerQueryResultBlock = (
    blocks: Block[],
    ids: string[]
): Block[] => {
    return ids.map((id) => {
        return blocks.find((b) => b.Id === id && b.BlockType === "QUERY_RESULT")!;
    });
};

const retrieveIdsFromRelationships = (
    relationships: Relationship[]
): string[] => {
    return relationships.reduce((accum, r) => {
        return [...accum, ...r.Ids!];
    }, [] as string[]);
};


const searchInBlocks = (
    blocks: Block[],
    fieldToSearch: string
): Answer[] => {
    const answers = findAnswerQueryBlock(blocks, fieldToSearch);

    if (!answers || !answers.length) {
        return [];
    }

    const ids = retrieveIdsFromRelationships(answers);

    const answersBlocks = findAnswerQueryResultBlock(blocks, ids).sort(
        (a, b) => a.Confidence! - b.Confidence!
    );

    if (!answersBlocks.length) {
        return [];
    }

    return answersBlocks.map((b) => {
        return {
            text: b.Text!,
            confidence: b.Confidence!,
        };
    });
};

const searchExistanceInLines = (
    blocks: Block[],
    key: string
): boolean => {
    const exists = blocks.find((b) => b.BlockType === "LINE" && b.Text === key);
    return typeof exists !== "undefined";
};
