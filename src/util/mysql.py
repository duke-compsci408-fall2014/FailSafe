def run_query(sql_object, query):
    connection = sql_object.connect()
    cursor = connection.cursor()
    cursor.execute(query)
    data = cursor.fetchall()
    return data

def run_query_with_commit(sql_object, query):
    connection = sql_object.connect()
    cursor = connection.cursor()
    try:
        cursor.execute(query)
        connection.commit()
    except:
        connection.rollback()

