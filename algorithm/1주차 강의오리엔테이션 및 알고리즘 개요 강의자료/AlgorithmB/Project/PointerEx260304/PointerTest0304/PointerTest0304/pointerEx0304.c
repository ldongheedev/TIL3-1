#include<stdio.h>

int main()
{
	int i = 5; // '=' = assign 
	//if(i == 5) // '==' = equal
	printf("i=%d\n", i);
	printf("Address of i = %d\n", &i);
	printf("Address of i = %p\n", &i);
	printf("Address of i = %X\n", &i);
	int* pi = 0; //* 기호가 하나 있는걸 단일 포인터 함수라고 함
	pi = &i;
	printf("pi = %p\n", pi);
	printf("*pi = %d\n", *pi);
	int k = 7;
	int* pk = &k;
	printf("*pk = %d\n", *pk);
	*pk = *pi; // k = 5;
	printf("final k = %d\n", k);

	int* *p2i = &pi;
	printf("Address of pi = %p\n", &pi);
	printf("p2i = %p\n", p2i);
	printf("*p2i = %p\n", *p2i);

	return 0;
}