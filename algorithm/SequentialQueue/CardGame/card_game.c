#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_CARDS 100000

typedef struct {
    int cards[MAX_CARDS];
    int front;
    int rear;
    int size;
} Queue;

void initQueue(Queue *q) {
    q->front = 0;
    q->rear = -1;
    q->size = 0;
}

void enqueue(Queue *q, int value) {
    q->rear = (q->rear + 1) % MAX_CARDS;
    q->cards[q->rear] = value;
    q->size++;
}

int dequeue(Queue *q) {
    int value = q->cards[q->front];
    q->front = (q->front + 1) % MAX_CARDS;
    q->size--;
    return value;
}

int peek(Queue *q) {
    return q->cards[q->front];
}

int isEmpty(Queue *q) {
    return q->size == 0;
}

int findLastCard(int n) {
    Queue q;
    initQueue(&q);

    // 카드 1부터 n까지 큐에 추가
    for (int i = 1; i <= n; i++) {
        enqueue(&q, i);
    }

    // 1장 남을 때까지 반복
    while (q.size > 1) {
        // 1. 가장 위의 카드를 버림
        dequeue(&q);

        // 2. 새로운 가장 위의 카드를 가장 아래로 옮김
        int topCard = dequeue(&q);
        enqueue(&q, topCard);
    }

    // 마지막에 남은 카드 반환
    return peek(&q);
}

int main() {
    int n;

    printf("카드의 개수를 입력하세요: ");
    scanf("%d", &n);

    if (n < 1 || n > MAX_CARDS) {
        printf("입력 범위는 1에서 %d 사이여야 합니다.\n", MAX_CARDS);
        return 1;
    }

    int result = findLastCard(n);

    printf("마지막에 남은 카드: %d\n", result);

    return 0;
}
