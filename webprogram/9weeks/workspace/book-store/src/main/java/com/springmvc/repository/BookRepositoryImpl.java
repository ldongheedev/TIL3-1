package com.springmvc.repository;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.springmvc.domain.Book;

@Repository
public class BookRepositoryImpl implements BookRepository {

	private JdbcTemplate template;

	public BookRepositoryImpl() {

	}

	@Autowired
	public void setJdbcTemplate(JdbcTemplate template) {
		this.template = template;
	}

	@Override
	public List<Book> getAllBookList() {
		// TODO Auto-generated method stub
		String sql = "select b_bookId, b_name, b_unitPrice, b_author, b_description, b_publisher, \r\n"
				+ "b_category, b_unitsInStock, b_releaseDate, b_condition from book";

		List<Book> listOfBooks = this.template.query(sql, new BookRowMapper());

		return listOfBooks;
	}

	@Override
	public List<Book> getBookListByCategory(String category) {
		// TODO Auto-generated method stub

		String sql = "select b_bookId, b_name, b_unitPrice, b_author, b_description, b_publisher, "
				+ "b_category, b_unitsInStock, b_releaseDate, b_condition from book"
				+ " where b_category like concat('%', ?, '%')";

		List<Book> listOfBooks = this.template.query(sql, new BookRowMapper(), category);

		return listOfBooks;
	}

	@Override
	public Set<Book> getBookListByFilter(Map<String, List<String>> filter) {
		Set<Book> booksByPublisher = new HashSet<Book>();
		Set<Book> booksByCategory = new HashSet<Book>();

		Set<String> booksByFilter = filter.keySet();
		if (booksByFilter.contains("publisher")) {
			for (int j = 0; j < filter.get("publisher").size(); j++) {
				String publisherName = filter.get("publisher").get(j);
				String sql = "SELECT b_bookId, b_name, b_unitPrice, b_author, b_description, "
						+ "b_publisher, b_category, b_unitsInStock, b_releaseDate, b_condition FROM book where "
						+ "b_publisher LIKE '%' || ? || '%'";
				booksByPublisher.addAll(this.template.query(sql, new BookRowMapper(), publisherName));
			}
		}

		if (booksByFilter.contains("category")) {
			for (int i = 0; i < filter.get("category").size(); i++) {
				String category = filter.get("category").get(i);
				String sql = "SELECT b_bookId, b_name, b_unitPrice, b_author, b_description, "
						+ "b_publisher, b_category, b_unitsInStock, b_releaseDate, b_condition FROM book where b_category "
						+ "LIKE '%' || ? || '%'";
				booksByCategory.addAll(this.template.query(sql, new BookRowMapper(), category));
			}
		}

		// booksByPublisher ∩ booksByCategory
		booksByCategory.retainAll(booksByPublisher);

		return booksByCategory;
	}

	@Override
	public Book getBookById(String bookId) {

		Book bookInfo = null;

		String sql = "select count(*) from book where b_bookId = ? ";
		int rowCount = this.template.queryForObject(sql, Integer.class, bookId);
		if (rowCount != 0) {
			sql = "SELECT b_bookId, b_name, b_unitPrice, b_author, b_description, b_publisher, \r\n"
					+ "b_category, b_unitsInStock, b_releaseDate, b_condition FROM book where b_bookId=?";
			bookInfo = this.template.queryForObject(sql, new BookRowMapper(), bookId);
		}

		if (bookInfo == null) {
			throw new IllegalArgumentException("도서 ID가 " + bookId + "인 도서를 찾을 수 없습니다.");
		}

		// TODO Auto-generated method stub
		return bookInfo;
	}

	@Override
	public void setNewBook(Book book) {
		String sql = "INSERT INTO book (b_bookId, b_name, b_unitPrice, b_author, "
				+ " b_description,  b_publisher, b_category, b_unitsInStock, "
				+ " b_releaseDate, b_condition) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
		this.template.update(sql, book.getBookId(), book.getName(), book.getUnitPrice(), book.getAuthor(),
				book.getDescription(), book.getPublisher(), book.getCategory(), book.getUnitsInStock(),
				book.getReleaseDate(), book.getCondition());

	}

}
