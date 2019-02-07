require 'nyny'
require 'faye/websocket'
require './src/helpers/mime.rb'

class App < NYNY::App
  def initialize()
    super()
    @clients = Array.new
  end

  get '/public/*path' do
    path = request.path[1..-1]
    if File.exists?(path)
      ext = File.extname(path)
      headers['Content-Type'] = mime_for(ext)
      File.read(request.path[1..-1])
    else
      status 404
      "Not Found"
    end
  end

  get '/' do
    render 'src/views/index.erb'
  end

  get '/ws' do |env|
    puts env
    # totally not copied from the github example
    if Faye::WebSocket.websocket?(env)
      ws = Faye::WebSocket.new(env)
      @clients << ws
  
      ws.on :message do |event|
        @clients.each do |c|
          c.send(event.data)
        end
      end
  
      ws.on :close do |event|
        @clients.delete ws
        ws = nil
      end
  
      # Return async Rack response
      ws.rack_response  
    else
      # Normal HTTP request
      status 404
      "Not Found. You should probably use the WebSocket protocol for this"
    end
  end
end
