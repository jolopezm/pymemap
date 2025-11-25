from bson import ObjectId

def serialize_doc(doc):
    """
    Recursively converts ObjectId to str in a dictionary or list.
    """
    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]
    if isinstance(doc, dict):
        return {k: serialize_doc(v) for k, v in doc.items()}
    if isinstance(doc, ObjectId):
        return str(doc)
    return doc
