$mime_types = {
  '.css' => 'text/css',
  '.js' => 'text/javascript'
}

def mime_for(type)
  $mime_types.fetch(type, 'text/plain')
end