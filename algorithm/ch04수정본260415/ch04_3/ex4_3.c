#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>
#include <windows.h>
#include "CircularLinkedList.h"

int main(void) 
{
	SetConsoleOutputCP(65001);//UTF-8,CP는 Code Page의 약자
	SetConsoleCP(65001); // 입력도 필요하면 설정

	linkedList_h* CL;
	listNode* p;

	CL = createLinkedList_h();		// 공백 원형 연결 리스트 생성
	printf("(1) 원형 연결 리스트 생성하기! \n");
	printList(CL);

	printf("\n(2) 원형 연결 리스트에 [월] 노드 삽입하기! \n");
	insertFirstNode(CL, "월");
	printList(CL);

	printf("\n(3) 원형 연결 리스트의 [월] 노드 뒤에 [수] 노드 삽입하기! \n");
	p = searchNode(CL, "월"); insertMiddleNode(CL, p, "수");
	printList(CL);

	printf("\n(4) 원형 연결 리스트의 [수] 노드 뒤에 [금] 노드 삽입하기! \n");
	p = searchNode(CL, "수"); insertMiddleNode(CL, p, "금");
	printList(CL);

	printf("\n(5) 원형 연결 리스트에서 [수] 노드 삭제하기! \n");
	p = searchNode(CL, "수");  deleteNode(CL, p);
	printList(CL);  	
	
	free(CL);
	//getchar();

	return 0;
}