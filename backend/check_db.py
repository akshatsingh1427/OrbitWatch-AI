from sqlalchemy import inspect
from database import engine

inspector = inspect(engine)

print("Tables:", inspector.get_table_names())

for table in inspector.get_table_names():
    print(f"\nTable: {table}")
    for column in inspector.get_columns(table):
        print(column["name"], column["type"])