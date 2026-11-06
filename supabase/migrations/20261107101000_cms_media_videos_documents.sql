-- The Media Library also keeps short videos and PDF documents (the admin checks each type's own size limit).
update storage.buckets
set allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','application/pdf'],
    file_size_limit = 52428800
where id = 'cms-media';
