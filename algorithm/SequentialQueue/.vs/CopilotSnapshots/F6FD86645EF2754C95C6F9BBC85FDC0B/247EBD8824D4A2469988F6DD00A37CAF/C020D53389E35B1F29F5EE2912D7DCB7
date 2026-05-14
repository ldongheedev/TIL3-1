#include <stdio.h>
#include <windows.h>
#include "LinkedQueue.h"

int cardGame(int N) {
    LQueueType* LQ = createLinkedQueue();
    int i, removed;

    for (i = 1; i <= N; i++) {
        enLQueue(LQ, (char)i);
    }

    printf("\n *** 카드게임 ***\n");
    printf(" N = %d 일 때\n\n", N);

    printf(" 초기 카드 상태 >>  [ ");
    QNode* temp = LQ->front;
    while (temp) {
        printf("%d ", (int)temp->data);
        temp = temp->link;
    }
    printf("]\n\n");

    while (!isLQEmpty(LQ) && LQ->front != LQ->rear) {
        removed = (int)deLQueue(LQ);
        printf(" 카드 %d 버림", removed);

        if (!isLQEmpty(LQ)) {
            int card = (int)deLQueue(LQ);
            enLQueue(LQ, (char)card);
            printf(" >> 카드 %d 이동 >>  [ ", card);

            temp = LQ->front;
            while (temp) {
                printf("%d ", (int)temp->data);
                temp = temp->link;
            }
            printf("]\n");
        }
    }

    if (!isLQEmpty(LQ)) {
        int result_card = (int)peekLQ(LQ);
        printf("\n [결과] 마지막에 남은 카드 : %d \n", result_card);
    }

    return 0;
}

int main(void) {
    SetConsoleOutputCP(65001);
    SetConsoleCP(65001);

    int N;
    printf("\n ========== 카드게임 ==========\n");
    printf(" N의 값을 입력하세요: ");
    scanf_s("%d", &N);

    if (N > 0) {
        cardGame(N);
    }
    else {
        printf(" 1 이상의 양수를 입력하세요.\n");
    }

    printf("\n");
    return 0;
}
