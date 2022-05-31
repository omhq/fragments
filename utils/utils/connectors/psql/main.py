import psycopg2


class ConnPsql:
  _conn = None
  _cursor = None
  _query = None

  def __init__(self, conn_data, query=None):
    self._conn = psycopg2.connect(
      database=conn_data["database"],
      user=conn_data["user"],
      password=conn_data["password"],
      host=conn_data["host"],
      port=conn_data["port"]
    )
    self._cursor = self._conn.cursor()

    if query:
      self._query = query

  def __enter__(self):
    return self

  def __exit__(self, exc_type, exc_val, exc_tb):
    self.close()

  @property
  def connection(self):
    return self._conn

  @property
  def cursor(self):
    return self._cursor

  def commit(self):
    self.connection.commit()

  def close(self, commit=True):
      if commit:
          self.commit()
      self.connection.close()

  def execute(self, sql, params=None):
      self.cursor.execute(sql, params or ())

  def fetchall(self):
      return self.cursor.fetchall()

  def fetchone(self):
      return self.cursor.fetchone()

  def query(self, query=None, params=None):
    if query:
      self.cursor.execute(query, params or ())
      return self.fetchall()

    if self._query:
      self.cursor.execute(self._query, params or ())
      return self.fetchall()
