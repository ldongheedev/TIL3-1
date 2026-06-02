package com.springmvc.domain;

import java.util.Objects;

public class Book {
	@Override
	public int hashCode() {
		return Objects.hash(author, bookId, category, condition, description, name, publisher, releaseDate, unitPrice,
				unitsInStock);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Book other = (Book) obj;
		return Objects.equals(author, other.author) && Objects.equals(bookId, other.bookId)
				&& Objects.equals(category, other.category) && Objects.equals(condition, other.condition)
				&& Objects.equals(description, other.description) && Objects.equals(name, other.name)
				&& Objects.equals(publisher, other.publisher) && Objects.equals(releaseDate, other.releaseDate)
				&& unitPrice == other.unitPrice && unitsInStock == other.unitsInStock;
	}

	private String bookId;
	private String name;
	private int unitPrice;
	private String author;
	private String description;
	private String publisher;
	private String category;
	private long unitsInStock;
	private String releaseDate;
	private String condition;
	
	public Book() {
		super();
	}

	public Book(String bookId, String name, int unitPrice) {
		super();
		this.bookId = bookId;
		this.name = name;
		this.unitPrice = unitPrice;
	}

	public String getBookId() {
		return bookId;
	}

	public void setBookId(String bookId) {
		this.bookId = bookId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public int getUnitPrice() {
		return unitPrice;
	}

	public void setUnitPrice(int unitPrice) {
		this.unitPrice = unitPrice;
	}

	public String getAuthor() {
		return author;
	}

	public void setAuthor(String author) {
		this.author = author;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getPublisher() {
		return publisher;
	}

	public void setPublisher(String publisher) {
		this.publisher = publisher;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public long getUnitsInStock() {
		return unitsInStock;
	}

	public void setUnitsInStock(long unitsInStock) {
		this.unitsInStock = unitsInStock;
	}

	public String getReleaseDate() {
		return releaseDate;
	}

	public void setReleaseDate(String releaseDate) {
		this.releaseDate = releaseDate;
	}

	public String getCondition() {
		return condition;
	}

	public void setCondition(String condition) {
		this.condition = condition;
	}
	
	
}
