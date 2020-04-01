using Microsoft.AspNetCore.Http;
using System.Collections;
using System.Collections.Generic;

namespace CalculateFunding.Frontend.UnitTests.PageModels.Users
{
    internal class RequestCookieCollection : IRequestCookieCollection
    {
        private Dictionary<string, string> dictionary;

        public RequestCookieCollection(Dictionary<string, string> dictionary)
        {
            this.dictionary = dictionary;
        }

        public string this[string key] => dictionary[key];

        public int Count => dictionary.Count;

        public ICollection<string> Keys => dictionary.Keys;

        public bool ContainsKey(string key)
        {
            return dictionary.ContainsKey(key);
        }

        public IEnumerator<KeyValuePair<string, string>> GetEnumerator()
        {
           return dictionary.GetEnumerator();
        }

        public bool TryGetValue(string key, out string value)
        {
            return dictionary.TryGetValue(key, out value);
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return dictionary.GetEnumerator();
        }
    }
}